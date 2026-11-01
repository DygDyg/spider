// Типы для игры Spider Solitaire

export type Suit = 'spades' | 'hearts' | 'diamonds' | 'clubs';
export type Rank = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;
export type Difficulty = 1 | 2 | 4;

export interface Card {
  id: string;
  suit: Suit;
  rank: Rank;
  faceUp: boolean;
}

export interface Column {
  cards: Card[];
}

export interface GameState {
  columns: Column[];
  stock: Card[];
  completedSets: Card[][];
  score: number;
  moves: number;
  difficulty: Difficulty;
  seed: string;
  startTime: number;
  elapsedTime: number;
  gameOver: boolean;
  gameWon: boolean;
}

export interface GameMove {
  fromColumn: number;
  toColumn: number;
  cardIndex: number;
  cards: Card[];
  flippedCard?: Card | null;
  completedSet?: Card[] | null;
  wasStockDeal?: boolean;
  previousStock?: Card[];
}

export interface GameHistory {
  past: GameState[];
  future: GameState[];
}

export interface GameSave {
  version: number;
  state: GameState;
  history: GameHistory;
}

export interface GameStats {
  gamesStarted: number;
  gamesWon: number;
  bestTime: number | null;
  bestMoves: number | null;
  bestScore: number | null;
  totalTime: number;
  history: GameRecord[];
}

export interface GameRecord {
  date: number;
  difficulty: Difficulty;
  won: boolean;
  time: number;
  moves: number;
  score: number;
}

export type AnimationSpeed = 'fast' | 'normal' | 'slow';

export interface Settings {
  cardDeck: 'opendecks' | 'classic';
  theme: 'classic' | 'dark' | 'blue' | 'light';
  animations: boolean;
  animationSpeed: AnimationSpeed;
  dealAnimation: boolean;
  moveAnimation: boolean;
  completeAnimation: boolean;
  sound: boolean;
  soundVolume: number; // 0-100
  cardSounds: boolean;
  interfaceSounds: boolean;
  victorySounds: boolean;
  autoCollect: boolean;
  highlightMoves: boolean;
  showTimer: boolean;
  cardSize: 'auto' | 'small' | 'medium' | 'large';
}

export interface Hint {
  fromColumn: number;
  toColumn: number;
  cardIndex: number;
}

export const SUIT_SYMBOLS: Record<Suit, string> = {
  spades: '♠',
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
};

export const SUIT_COLORS: Record<Suit, string> = {
  spades: '#1a1a2e',
  hearts: '#dc2626',
  diamonds: '#dc2626',
  clubs: '#1a1a2e',
};

export const RANK_NAMES: Record<Rank, string> = {
  1: 'A',
  2: '2',
  3: '3',
  4: '4',
  5: '5',
  6: '6',
  7: '7',
  8: '8',
  9: '9',
  10: '10',
  11: 'J',
  12: 'Q',
  13: 'K',
};

export const DIFFICULTY_NAMES: Record<Difficulty, string> = {
  1: 'Лёгкий (1 масть)',
  2: 'Средний (2 масти)',
  4: 'Сложный (4 масти)',
};
