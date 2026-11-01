import { useState, useCallback, useEffect, useRef } from 'react';
import { GameState, Difficulty, Hint, Settings, GameStats, GameRecord } from '../game/types';
import {
  createInitialState,
  moveCards,
  dealFromStock,
  getHints,
  cloneState,
  canDeal,
  validateCardCount,
} from '../game/engine';
import { loadGame, saveGame, loadSettings, saveSettings, loadStats, saveStats } from '../services/storage';

const SAVE_VERSION = 1;

export function useGame() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [history, setHistory] = useState<{ past: GameState[]; future: GameState[] }>({ past: [], future: [] });
  const [hint, setHint] = useState<Hint | null>(null);
  const [settings, setSettingsState] = useState<Settings>(() => loadSettings());
  const [stats, setStatsState] = useState<Record<Difficulty, GameStats>>(() => loadStats());
  const [notification, setNotification] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const gameStateRef = useRef(gameState);
  const elapsedTimeRef = useRef(elapsedTime);
  const statsRef = useRef(stats);
  
  // Keep refs in sync
  gameStateRef.current = gameState;
  elapsedTimeRef.current = elapsedTime;
  statsRef.current = stats;

  // Загрузка сохранённой игры
  useEffect(() => {
    const saved = loadGame();
    if (saved && saved.version === SAVE_VERSION) {
      setGameState(saved.state);
      setHistory(saved.history);
      setElapsedTime(saved.state.elapsedTime);
    }
  }, []);

  // Таймер
  useEffect(() => {
    if (gameState && !gameState.gameOver) {
      timerRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [gameState?.gameOver, gameState?.startTime]);

  // Автосохранение
  useEffect(() => {
    if (gameState) {
      const stateWithTime = { ...gameState, elapsedTime };
      saveGame({
        version: SAVE_VERSION,
        state: stateWithTime,
        history,
      });
    }
  }, [gameState, history, elapsedTime]);

  // Уведомления
  const showNotification = useCallback((msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  }, []);

  // Обработка победы
  const handleVictory = useCallback((state: GameState) => {
    const time = elapsedTimeRef.current;
    const currentStats = statsRef.current;
    const diff = state.difficulty;
    
    const newStats = { ...currentStats };
    if (!newStats[diff]) {
      newStats[diff] = { gamesStarted: 0, gamesWon: 0, bestTime: null, bestMoves: null, bestScore: null, totalTime: 0, history: [] };
    }

    const record: GameRecord = {
      date: Date.now(),
      difficulty: diff,
      won: true,
      time,
      moves: state.moves,
      score: state.score,
    };

    newStats[diff] = {
      ...newStats[diff],
      gamesWon: newStats[diff].gamesWon + 1,
      bestTime: newStats[diff].bestTime === null ? time : Math.min(newStats[diff].bestTime!, time),
      bestMoves: newStats[diff].bestMoves === null ? state.moves : Math.min(newStats[diff].bestMoves!, state.moves),
      bestScore: newStats[diff].bestScore === null ? state.score : Math.max(newStats[diff].bestScore!, state.score),
      totalTime: newStats[diff].totalTime + time,
      history: [record, ...newStats[diff].history].slice(0, 20),
    };

    setStatsState(newStats);
    saveStats(newStats);
  }, []);

  // Новая игра
  const startNewGame = useCallback((difficulty: Difficulty, seed?: string) => {
    const newState = createInitialState(difficulty, seed);
    setGameState(newState);
    setHistory({ past: [], future: [] });
    setHint(null);
    setElapsedTime(0);

    // Обновляем статистику
    setStatsState(prev => {
      const newStats = { ...prev };
      if (!newStats[difficulty]) {
        newStats[difficulty] = { gamesStarted: 0, gamesWon: 0, bestTime: null, bestMoves: null, bestScore: null, totalTime: 0, history: [] };
      }
      newStats[difficulty] = {
        ...newStats[difficulty],
        gamesStarted: newStats[difficulty].gamesStarted + 1,
      };
      saveStats(newStats);
      return newStats;
    });
  }, []);

  // Перемещение карт
  const makeMove = useCallback((fromColumn: number, toColumn: number, cardIndex: number): boolean => {
    const currentState = gameStateRef.current;
    if (!currentState || currentState.gameOver) return false;

    const result = moveCards(currentState, fromColumn, toColumn, cardIndex);
    if (!result) return false;

    // Валидация
    if (!validateCardCount(result.newState)) {
      console.error('Card count invariant violated!');
      return false;
    }

    setHistory(prev => ({
      past: [...prev.past, cloneState(currentState)],
      future: [],
    }));
    setGameState(result.newState);
    setHint(null);
    // Сбрасываем подсказки при выполнении хода
    lastHintsRef.current = [];
    hintIndexRef.current = 0;

    // Проверяем победу
    if (result.newState.gameWon) {
      handleVictory(result.newState);
    }

    return true;
  }, [handleVictory]);

  // Раздача из резерва
  const deal = useCallback(() => {
    const currentState = gameStateRef.current;
    if (!currentState || currentState.gameOver) return;

    if (!canDeal(currentState)) {
      if (currentState.stock.length === 0) {
        showNotification('Резерв пуст');
      } else {
        showNotification('Заполните пустые колонки перед раздачей');
      }
      return;
    }

    const newState = dealFromStock(currentState);
    if (!newState) return;

    if (!validateCardCount(newState)) {
      console.error('Card count invariant violated after deal!');
      return;
    }

    setHistory(prev => ({
      past: [...prev.past, cloneState(currentState)],
      future: [],
    }));
    setGameState(newState);
    setHint(null);
    // Сбрасываем подсказки при раздаче
    lastHintsRef.current = [];
    hintIndexRef.current = 0;

    if (newState.gameWon) {
      handleVictory(newState);
    }
  }, [showNotification, handleVictory]);

  // Отмена хода
  const undo = useCallback(() => {
    if (history.past.length === 0) return;

    const previousState = history.past[history.past.length - 1];
    setHistory(prev => ({
      past: prev.past.slice(0, -1),
      future: [cloneState(gameStateRef.current!), ...prev.future],
    }));
    setGameState(previousState);
    setHint(null);
  }, [history]);

  // Повтор хода
  const redo = useCallback(() => {
    if (history.future.length === 0) return;

    const nextState = history.future[0];
    setHistory(prev => ({
      past: [...prev.past, cloneState(gameStateRef.current!)],
      future: prev.future.slice(1),
    }));
    setGameState(nextState);
    setHint(null);
  }, [history]);

  // Храним предыдущие подсказки и индекс текущей
  const hintIndexRef = useRef(0);
  const lastHintsRef = useRef<Hint[]>([]);

  // Подсказка
  const showHint = useCallback(() => {
    const currentState = gameStateRef.current;
    if (!currentState || currentState.gameOver) return;

    // Если подсказки ещё не рассчитаны или это первый вызов
    if (lastHintsRef.current.length === 0) {
      const hints = getHints(currentState, []);
      lastHintsRef.current = hints;
      hintIndexRef.current = 0;
    } else {
      // Переключаемся на следующую подсказку
      hintIndexRef.current = (hintIndexRef.current + 1) % Math.max(1, lastHintsRef.current.length);
    }

    if (lastHintsRef.current.length > 0) {
      setHint(lastHintsRef.current[hintIndexRef.current]);
    } else if (canDeal(currentState)) {
      showNotification('Полезных ходов не найдено. Раздайте карты из резерва.');
    } else {
      showNotification('Полезных ходов не найдено.');
    }
  }, [showNotification]);

  // Обновление настроек
  const updateSettings = useCallback((newSettings: Partial<Settings>) => {
    setSettingsState(prev => {
      const updated = { ...prev, ...newSettings };
      saveSettings(updated);
      return updated;
    });
  }, []);

  // Сброс статистики
  const resetStats = useCallback(() => {
    const empty: Record<Difficulty, GameStats> = {
      1: { gamesStarted: 0, gamesWon: 0, bestTime: null, bestMoves: null, bestScore: null, totalTime: 0, history: [] },
      2: { gamesStarted: 0, gamesWon: 0, bestTime: null, bestMoves: null, bestScore: null, totalTime: 0, history: [] },
      4: { gamesStarted: 0, gamesWon: 0, bestTime: null, bestMoves: null, bestScore: null, totalTime: 0, history: [] },
    };
    setStatsState(empty);
    saveStats(empty);
  }, []);

  return {
    gameState,
    history,
    hint,
    settings,
    stats,
    notification,
    elapsedTime,
    startNewGame,
    makeMove,
    deal,
    undo,
    redo,
    showHint,
    updateSettings,
    resetStats,
    showNotification,
    canDeal: gameState ? canDeal(gameState) : false,
  };
}
