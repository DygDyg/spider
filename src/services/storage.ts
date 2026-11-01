import { GameState, Difficulty, Settings, GameStats, GameSave } from '../game/types';

const GAME_KEY = 'spider_solitaire_game';
const SETTINGS_KEY = 'spider_solitaire_settings';
const STATS_KEY = 'spider_solitaire_stats';

const DEFAULT_SETTINGS: Settings = {
  theme: 'classic',
  cardDeck: 'opendecks',
  animations: true,
  animationSpeed: 'normal',
  dealAnimation: true,
  moveAnimation: true,
  completeAnimation: true,
  sound: false,
  soundVolume: 50,
  cardSounds: true,
  interfaceSounds: true,
  victorySounds: true,
  autoCollect: true,
  highlightMoves: true,
  showTimer: true,
  cardSize: 'auto',
};

const DEFAULT_STATS: Record<Difficulty, GameStats> = {
  1: { gamesStarted: 0, gamesWon: 0, bestTime: null, bestMoves: null, bestScore: null, totalTime: 0, history: [] },
  2: { gamesStarted: 0, gamesWon: 0, bestTime: null, bestMoves: null, bestScore: null, totalTime: 0, history: [] },
  4: { gamesStarted: 0, gamesWon: 0, bestTime: null, bestMoves: null, bestScore: null, totalTime: 0, history: [] },
};

export function saveGame(save: GameSave): void {
  try {
    localStorage.setItem(GAME_KEY, JSON.stringify(save));
  } catch (e) {
    console.error('Failed to save game:', e);
  }
}

export function loadGame(): GameSave | null {
  try {
    const data = localStorage.getItem(GAME_KEY);
    if (!data) return null;
    
    const save = JSON.parse(data) as GameSave;
    
    // Валидация структуры
    if (!save.version || !save.state || !save.state.columns || !save.state.stock) {
      console.warn('Invalid save data, clearing...');
      localStorage.removeItem(GAME_KEY);
      return null;
    }
    
    // Проверка количества карт
    let totalCards = 0;
    for (const col of save.state.columns) {
      totalCards += col.cards.length;
    }
    totalCards += save.state.stock.length;
    for (const set of save.state.completedSets) {
      totalCards += set.length;
    }
    
    if (totalCards !== 104) {
      console.warn(`Invalid card count: ${totalCards}, clearing save...`);
      localStorage.removeItem(GAME_KEY);
      return null;
    }
    
    return save;
  } catch (e) {
    console.error('Failed to load game:', e);
    localStorage.removeItem(GAME_KEY);
    return null;
  }
}

export function clearGame(): void {
  localStorage.removeItem(GAME_KEY);
}

export function saveSettings(settings: Settings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
}

export function loadSettings(): Settings {
  try {
    const data = localStorage.getItem(SETTINGS_KEY);
    if (!data) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
  } catch (e) {
    console.error('Failed to load settings:', e);
    return DEFAULT_SETTINGS;
  }
}

export function saveStats(stats: Record<Difficulty, GameStats>): void {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch (e) {
    console.error('Failed to save stats:', e);
  }
}

export function loadStats(): Record<Difficulty, GameStats> {
  try {
    const data = localStorage.getItem(STATS_KEY);
    if (!data) return DEFAULT_STATS;
    return { ...DEFAULT_STATS, ...JSON.parse(data) };
  } catch (e) {
    console.error('Failed to load stats:', e);
    return DEFAULT_STATS;
  }
}
