import { Card, Column, GameState, Difficulty, Suit, Rank, Hint, GameMove } from './types';

// Генерация уникального ID
let cardIdCounter = 0;
export function generateCardId(): string {
  cardIdCounter++;
  const random = Math.random().toString(36).substring(2, 8);
  return `c_${cardIdCounter}_${random}`;
}

// Seed-based random number generator (Mulberry32)
function mulberry32(seed: number) {
  return function() {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function seedToNumber(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

// Fisher-Yates shuffle с seed
export function shuffleDeck(cards: Card[], seed: string): Card[] {
  const shuffled = [...cards];
  const random = mulberry32(seedToNumber(seed));
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Создание колоды для данной сложности
export function createDeck(difficulty: Difficulty): Card[] {
  const cards: Card[] = [];
  const suits: Suit[] = difficulty === 1 
    ? ['spades'] 
    : difficulty === 2 
    ? ['spades', 'hearts'] 
    : ['spades', 'hearts', 'diamonds', 'clubs'];
  
  const copies = 8 / suits.length;
  
  for (let copy = 0; copy < copies; copy++) {
    for (const suit of suits) {
      for (let rank = 1; rank <= 13; rank++) {
        cards.push({
          id: generateCardId(),
          suit,
          rank: rank as Rank,
          faceUp: false,
        });
      }
    }
  }
  
  return cards;
}

// Генерация seed
export function generateSeed(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Создание начального состояния игры
export function createInitialState(difficulty: Difficulty, seed?: string): GameState {
  const gameSeed = seed || generateSeed();
  const deck = createDeck(difficulty);
  const shuffled = shuffleDeck(deck, gameSeed);
  
  const columns: Column[] = Array.from({ length: 10 }, () => ({ cards: [] }));
  
  // Раздача 54 карт: первые 4 колонки по 6, остальные 6 по 5
  let cardIndex = 0;
  for (let col = 0; col < 10; col++) {
    const numCards = col < 4 ? 6 : 5;
    for (let i = 0; i < numCards; i++) {
      const card = { ...shuffled[cardIndex] };
      card.faceUp = i === numCards - 1; // Только верхняя карта открыта
      columns[col].cards.push(card);
      cardIndex++;
    }
  }
  
  // Оставшиеся 50 карт в резерв
  const stock = shuffled.slice(cardIndex).map(card => ({ ...card, faceUp: false }));
  
  return {
    columns,
    stock,
    completedSets: [],
    score: 500,
    moves: 0,
    difficulty,
    seed: gameSeed,
    startTime: Date.now(),
    elapsedTime: 0,
    gameOver: false,
    gameWon: false,
  };
}

// Проверка: является ли последовательность карт валидной для перемещения
export function isValidSequence(cards: Card[]): boolean {
  if (cards.length === 0) return true;
  if (cards.length === 1) return cards[0].faceUp;
  
  // Все карты должны быть открыты
  if (!cards.every(c => c.faceUp)) return false;
  
  // Все карты должны быть одной масти
  const suit = cards[0].suit;
  if (!cards.every(c => c.suit === suit)) return false;
  
  // Карты должны идти по убыванию на 1
  for (let i = 1; i < cards.length; i++) {
    if (cards[i - 1].rank !== cards[i].rank + 1) return false;
  }
  
  return true;
}

// Получить максимальную валидную последовательность с конца колонки
export function getMovableSequence(column: Column, fromIndex: number): Card[] | null {
  if (fromIndex < 0 || fromIndex >= column.cards.length) return null;
  
  const cards = column.cards.slice(fromIndex);
  if (!cards[0].faceUp) return null;
  
  if (isValidSequence(cards)) return cards;
  return null;
}

// Проверка: можно ли положить карты на целевую колонку
export function canPlaceCards(cards: Card[], targetColumn: Column): boolean {
  if (targetColumn.cards.length === 0) return true;
  
  const topCard = targetColumn.cards[targetColumn.cards.length - 1];
  if (!topCard.faceUp) return false;
  
  // Карта должна быть на 1 ранг выше первой перемещаемой карты
  return topCard.rank === cards[0].rank + 1;
}

// Выполнить перемещение карт
export function moveCards(
  state: GameState,
  fromColumn: number,
  toColumn: number,
  cardIndex: number
): { newState: GameState; move: GameMove } | null {
  if (fromColumn === toColumn) return null;
  
  const sourceCol = state.columns[fromColumn];
  const targetCol = state.columns[toColumn];
  
  if (cardIndex < 0 || cardIndex >= sourceCol.cards.length) return null;
  
  const cardsToMove = sourceCol.cards.slice(cardIndex);
  if (!isValidSequence(cardsToMove)) return null;
  if (!canPlaceCards(cardsToMove, targetCol)) return null;
  
  // Создаём новое состояние
  const newColumns = state.columns.map((col, i) => {
    if (i === fromColumn) {
      const newCards = [...col.cards.slice(0, cardIndex)];
      // Открываем верхнюю карту если она закрыта
      if (newCards.length > 0 && !newCards[newCards.length - 1].faceUp) {
        newCards[newCards.length - 1] = { ...newCards[newCards.length - 1], faceUp: true };
      }
      return { cards: newCards };
    }
    if (i === toColumn) {
      return { cards: [...col.cards, ...cardsToMove] };
    }
    return { cards: [...col.cards] };
  });
  
  const flippedCard = cardIndex > 0 && !sourceCol.cards[cardIndex - 1].faceUp
    ? { ...sourceCol.cards[cardIndex - 1], faceUp: true }
    : undefined;
  
  let newState: GameState = {
    ...state,
    columns: newColumns,
    score: state.score - 1,
    moves: state.moves + 1,
  };
  
  // Проверяем автоматическую сборку
  const result = checkAndRemoveCompleteSequences(newState);
  newState = result.state;
  
  const move: GameMove = {
    fromColumn,
    toColumn,
    cardIndex,
    cards: cardsToMove,
    flippedCard,
    completedSet: result.removedSet,
  };
  
  // Проверяем победу
  if (newState.completedSets.length === 8) {
    newState.gameWon = true;
    newState.gameOver = true;
  }
  
  return { newState, move };
}

// Проверка и удаление завершённых последовательностей
export function checkAndRemoveCompleteSequences(state: GameState): { state: GameState; removedSet: Card[] | null } {
  let removedSet: Card[] | null = null;
  const newColumns = state.columns.map(col => {
    const cards = [...col.cards];
    // Проверяем последние 13 карт
    if (cards.length >= 13) {
      const last13 = cards.slice(-13);
      if (isCompleteSequence(last13)) {
        removedSet = last13;
        const remaining = cards.slice(0, -13);
        // Открываем верхнюю карту
        if (remaining.length > 0 && !remaining[remaining.length - 1].faceUp) {
          remaining[remaining.length - 1] = { ...remaining[remaining.length - 1], faceUp: true };
        }
        return { cards: remaining };
      }
    }
    return { cards };
  });
  
  if (removedSet) {
    return {
      state: {
        ...state,
        columns: newColumns,
        completedSets: [...state.completedSets, removedSet],
        score: state.score + 100,
      },
      removedSet,
    };
  }
  
  return { state, removedSet: null };
}

// Проверка полной последовательности K → A одной масти
export function isCompleteSequence(cards: Card[]): boolean {
  if (cards.length !== 13) return false;
  
  const suit = cards[0].suit;
  if (!cards.every(c => c.suit === suit && c.faceUp)) return false;
  
  // K(13), Q(12), J(11), 10, 9, ..., A(1)
  for (let i = 0; i < 13; i++) {
    if (cards[i].rank !== 13 - i) return false;
  }
  
  return true;
}

// Раздача из резерва
export function dealFromStock(state: GameState): GameState | null {
  if (state.stock.length === 0) return null;
  
  // Проверяем что нет пустых колонок
  const hasEmptyColumn = state.columns.some(col => col.cards.length === 0);
  if (hasEmptyColumn) return null;
  
  const newColumns = state.columns.map((col, i) => {
    const card = { ...state.stock[i], faceUp: true };
    return { cards: [...col.cards, card] };
  });
  
  const newStock = state.stock.slice(10);
  
  let newState: GameState = {
    ...state,
    columns: newColumns,
    stock: newStock,
    moves: state.moves + 1,
  };
  
  // Проверяем автоматическую сборку после раздачи
  const result = checkAndRemoveCompleteSequences(newState);
  newState = result.state;
  
  // Проверяем победу
  if (newState.completedSets.length === 8) {
    newState.gameWon = true;
    newState.gameOver = true;
  }
  
  return newState;
}

// Получение подсказок
export function getHints(state: GameState): Hint[] {
  const hints: Hint[] = [];
  
  for (let fromCol = 0; fromCol < 10; fromCol++) {
    const column = state.columns[fromCol];
    if (column.cards.length === 0) continue;
    
    // Находим все возможные точки начала перемещения
    for (let cardIdx = column.cards.length - 1; cardIdx >= 0; cardIdx--) {
      const card = column.cards[cardIdx];
      if (!card.faceUp) break;
      
      const seq = column.cards.slice(cardIdx);
      if (!isValidSequence(seq)) break;
      
      for (let toCol = 0; toCol < 10; toCol++) {
        if (toCol === fromCol) continue;
        
        const targetCol = state.columns[toCol];
        if (!canPlaceCards(seq, targetCol)) continue;
        
        // Предпочитаем ходы, открывающие закрытые карты
        const opensCard = cardIdx > 0 && !column.cards[cardIdx - 1].faceUp;
        // Предпочитаем одномастные ходы
        const sameSuit = targetCol.cards.length > 0 && 
          targetCol.cards[targetCol.cards.length - 1].suit === card.suit;
        
        hints.push({
          fromColumn: fromCol,
          toColumn: toCol,
          cardIndex: cardIdx,
          // Приоритет: меньше = лучше
        });
        
        // Сортируем по приоритету (внешняя логика)
        (hints[hints.length - 1] as any)._priority = 
          (opensCard ? 0 : 10) + (sameSuit ? 0 : 5) + (targetCol.cards.length === 0 ? 3 : 0);
      }
    }
  }
  
  // Сортируем по приоритету
  hints.sort((a, b) => ((a as any)._priority || 0) - ((b as any)._priority || 0));
  
  // Убираем служебное поле
  return hints.map(({ fromColumn, toColumn, cardIndex }) => ({ fromColumn, toColumn, cardIndex }));
}

// Проверка инварианта: сумма карт = 104
export function validateCardCount(state: GameState): boolean {
  let total = 0;
  for (const col of state.columns) {
    total += col.cards.length;
  }
  total += state.stock.length;
  for (const set of state.completedSets) {
    total += set.length;
  }
  return total === 104;
}

// Глубокое копирование состояния
export function cloneState(state: GameState): GameState {
  return {
    ...state,
    columns: state.columns.map(col => ({
      cards: col.cards.map(card => ({ ...card })),
    })),
    stock: state.stock.map(card => ({ ...card })),
    completedSets: state.completedSets.map(set => set.map(card => ({ ...card }))),
  };
}

// Проверка: можно ли сделать раздачу
export function canDeal(state: GameState): boolean {
  return state.stock.length > 0 && !state.columns.some(col => col.cards.length === 0);
}

// Получить все доступные ходы для проверки наличия ходов
export function hasAvailableMoves(state: GameState): boolean {
  for (let fromCol = 0; fromCol < 10; fromCol++) {
    const column = state.columns[fromCol];
    if (column.cards.length === 0) continue;
    
    for (let cardIdx = column.cards.length - 1; cardIdx >= 0; cardIdx--) {
      if (!column.cards[cardIdx].faceUp) break;
      
      const seq = column.cards.slice(cardIdx);
      if (!isValidSequence(seq)) break;
      
      for (let toCol = 0; toCol < 10; toCol++) {
        if (toCol === fromCol) continue;
        if (canPlaceCards(seq, state.columns[toCol])) return true;
      }
    }
  }
  
  return false;
}
