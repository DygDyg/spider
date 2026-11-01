import React, { useState, useEffect, useCallback } from 'react';
import { useGame } from './hooks/useGame';
import { GameBoard } from './components/GameBoard/GameBoard';
import { Toolbar } from './components/Toolbar/Toolbar';
import { DifficultyModal, SettingsModal, StatsModal, VictoryModal } from './components/Modals/Modals';
import { Difficulty } from './game/types';

function App() {
  const {
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
    canDeal,
  } = useGame();

  const [showDifficultyModal, setShowDifficultyModal] = useState(!gameState);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showVictoryModal, setShowVictoryModal] = useState(false);
  
  // Показываем модальное окно победы когда игра выиграна
  React.useEffect(() => {
    if (gameState?.gameWon) {
      setShowVictoryModal(true);
    }
  }, [gameState?.gameWon]);

  // Применение темы
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme);
  }, [settings.theme]);

  // Горячие клавиши
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Не перехватываем если пользователь вводит текст
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.ctrlKey && e.key === 'z') {
        e.preventDefault();
        undo();
      } else if ((e.ctrlKey && e.key === 'y') || (e.ctrlKey && e.shiftKey && e.key === 'z')) {
        e.preventDefault();
        redo();
      } else if (e.key === 'h' || e.key === 'H' || e.key === 'р' || e.key === 'Р') {
        e.preventDefault();
        showHint();
      } else if (e.key === 'n' || e.key === 'N' || e.key === 'т' || e.key === 'Т') {
        e.preventDefault();
        setShowDifficultyModal(true);
      } else if (e.key === 'Escape') {
        setShowDifficultyModal(false);
        setShowSettingsModal(false);
        setShowStatsModal(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, showHint]);

  const handleStartNewGame = useCallback((difficulty: Difficulty) => {
    startNewGame(difficulty);
    setShowDifficultyModal(false);
  }, [startNewGame]);

  const handleNewGameClick = useCallback(() => {
    setShowDifficultyModal(true);
  }, []);

  if (!gameState) {
    return (
      <div className={`app theme-${settings.theme}`}>
        <div className="welcome-screen">
          <div className="welcome-content">
            <h1 className="welcome-title">🕷️ Пасьянс Паук</h1>
            <p className="welcome-subtitle">Классический карточный пасьянс</p>
            <button className="btn-primary btn-large" onClick={() => setShowDifficultyModal(true)}>
              Начать игру
            </button>
          </div>
        </div>
        <DifficultyModal
          isOpen={showDifficultyModal}
          onClose={() => setShowDifficultyModal(false)}
          onStart={handleStartNewGame}
          hasActiveGame={false}
        />
      </div>
    );
  }

  return (
    <div className={`app theme-${settings.theme}`}>
      <Toolbar
        gameState={gameState}
        elapsedTime={elapsedTime}
        canUndo={history.past.length > 0}
        canRedo={history.future.length > 0}
        canDeal={canDeal}
        onNewGame={handleNewGameClick}
        onUndo={undo}
        onRedo={redo}
        onHint={showHint}
        onDeal={deal}
        onSettings={() => setShowSettingsModal(true)}
        onStats={() => setShowStatsModal(true)}
      />

      <GameBoard
        gameState={gameState}
        hint={hint}
        settings={settings}
        onMove={makeMove}
        onDeal={deal}
        canDeal={canDeal}
      />

      {/* Уведомление */}
      {notification && (
        <div className="notification">
          {notification}
        </div>
      )}

      {/* Модальные окна */}
      <DifficultyModal
        isOpen={showDifficultyModal}
        onClose={() => setShowDifficultyModal(false)}
        onStart={handleStartNewGame}
        hasActiveGame={true}
      />

      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        settings={settings}
        onUpdate={updateSettings}
      />

      <StatsModal
        isOpen={showStatsModal}
        onClose={() => setShowStatsModal(false)}
        stats={stats}
        onReset={resetStats}
      />

      <VictoryModal
        isOpen={showVictoryModal && gameState.gameWon}
        gameState={gameState}
        elapsedTime={elapsedTime}
        onClose={() => setShowVictoryModal(false)}
        onNewGame={() => { setShowVictoryModal(false); handleNewGameClick(); }}
      />
    </div>
  );
}

export default App;
