import React, { useState, useRef, useCallback, useEffect } from 'react';
import { GameState, Hint, Card as CardType, Settings } from '../../game/types';
import { isValidSequence, canPlaceCards } from '../../game/engine';
import { CardComponent } from '../Card/Card';

interface GameBoardProps {
  gameState: GameState;
  hint: Hint | null;
  settings: Settings;
  onMove: (from: number, to: number, cardIndex: number) => boolean;
  onDeal: () => void;
  canDeal: boolean;
}

interface DragState {
  fromColumn: number;
  cardIndex: number;
  cards: CardType[];
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  isDragging: boolean;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  gameState,
  hint,
  settings,
  onMove,
  onDeal,
  canDeal: canDealProp,
}) => {
  const [selectedCard, setSelectedCard] = useState<{ column: number; index: number } | null>(null);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [dropTarget, setDropTarget] = useState<number | null>(null);
  const [boardHeight, setBoardHeight] = useState(600);
  const boardRef = useRef<HTMLDivElement>(null);
  const columnRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Track board height for card offset calculation
  useEffect(() => {
    const updateHeight = () => {
      if (boardRef.current) {
        setBoardHeight(boardRef.current.clientHeight);
      }
    };
    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  // Определение колонки по координатам
  const getColumnAtPoint = useCallback((x: number, y: number): number | null => {
    for (let i = 0; i < 10; i++) {
      const el = columnRefs.current[i];
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      if (x >= rect.left && x <= rect.right) {
        return i;
      }
    }
    return null;
  }, []);

  // Начало перетаскивания
  const handlePointerDown = useCallback((e: React.PointerEvent, colIndex: number, cardIndex: number) => {
    if (gameState.gameOver) return;
    
    const card = gameState.columns[colIndex].cards[cardIndex];
    if (!card.faceUp) return;

    const cards = gameState.columns[colIndex].cards.slice(cardIndex);
    if (!isValidSequence(cards)) return;

    e.preventDefault();
    e.stopPropagation();

    setDragState({
      fromColumn: colIndex,
      cardIndex,
      cards,
      startX: e.clientX,
      startY: e.clientY,
      currentX: e.clientX,
      currentY: e.clientY,
      isDragging: false,
    });
    setSelectedCard(null);
  }, [gameState]);

  // Перемещение
  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragState) return;

    const dx = e.clientX - dragState.startX;
    const dy = e.clientY - dragState.startY;
    
    if (!dragState.isDragging && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
      setDragState(prev => prev ? { ...prev, isDragging: true } : null);
    }

    if (dragState.isDragging) {
      setDragState(prev => prev ? { ...prev, currentX: e.clientX, currentY: e.clientY } : null);
      
      const col = getColumnAtPoint(e.clientX, e.clientY);
      setDropTarget(col !== dragState.fromColumn ? col : null);
    }
  }, [dragState, getColumnAtPoint]);

  // Конец перетаскивания
  const handlePointerUp = useCallback(() => {
    if (!dragState) return;

    if (dragState.isDragging && dropTarget !== null && dropTarget !== dragState.fromColumn) {
      const targetCol = gameState.columns[dropTarget];
      const cards = gameState.columns[dragState.fromColumn].cards.slice(dragState.cardIndex);
      
      if (targetCol.cards.length === 0 || canPlaceCards(cards, targetCol)) {
        onMove(dragState.fromColumn, dropTarget, dragState.cardIndex);
      }
    }

    setDragState(null);
    setDropTarget(null);
  }, [dragState, dropTarget, gameState, onMove]);

  // Клик по карте
  const handleCardClick = useCallback((colIndex: number, cardIndex: number) => {
    if (gameState.gameOver) return;
    if (dragState?.isDragging) return;

    const card = gameState.columns[colIndex].cards[cardIndex];
    if (!card.faceUp) return;

    if (selectedCard) {
      // Пытаемся выполнить ход
      if (selectedCard.column === colIndex) {
        setSelectedCard(null);
        return;
      }

      const cards = gameState.columns[selectedCard.column].cards.slice(selectedCard.index);
      const targetCol = gameState.columns[colIndex];
      
      if (isValidSequence(cards) && (targetCol.cards.length === 0 || canPlaceCards(cards, targetCol))) {
        onMove(selectedCard.column, colIndex, selectedCard.index);
        setSelectedCard(null);
        return;
      }
    }

    // Выбираем карту
    const cards = gameState.columns[colIndex].cards.slice(cardIndex);
    if (isValidSequence(cards)) {
      setSelectedCard({ column: colIndex, index: cardIndex });
    }
  }, [gameState, selectedCard, dragState, onMove]);

  // Клик по пустой колонке
  const handleColumnClick = useCallback((colIndex: number) => {
    if (gameState.gameOver) return;
    if (gameState.columns[colIndex].cards.length > 0) return;

    if (selectedCard) {
      const cards = gameState.columns[selectedCard.column].cards.slice(selectedCard.index);
      if (isValidSequence(cards)) {
        onMove(selectedCard.column, colIndex, selectedCard.index);
        setSelectedCard(null);
      }
    }
  }, [gameState, selectedCard, onMove]);

  // Двойной клик - автоматический ход
  const handleDoubleClick = useCallback((colIndex: number, cardIndex: number) => {
    if (gameState.gameOver) return;
    
    const card = gameState.columns[colIndex].cards[cardIndex];
    if (!card.faceUp) return;

    const cards = gameState.columns[colIndex].cards.slice(cardIndex);
    if (!isValidSequence(cards)) return;

    // Ищем подходящую колонку (предпочитаем непустые)
    let bestTarget = -1;
    for (let i = 0; i < 10; i++) {
      if (i === colIndex) continue;
      if (canPlaceCards(cards, gameState.columns[i])) {
        if (gameState.columns[i].cards.length > 0) {
          // Проверяем совпадение масти
          const topCard = gameState.columns[i].cards[gameState.columns[i].cards.length - 1];
          if (topCard.suit === cards[0].suit) {
            onMove(colIndex, i, cardIndex);
            return;
          }
          if (bestTarget === -1) bestTarget = i;
        }
      }
    }
    
    // Если не нашли одномастную, используем первую подходящую непустую
    if (bestTarget !== -1) {
      onMove(colIndex, bestTarget, cardIndex);
      return;
    }
    
    // Если не нашли непустую, пробуем пустую
    for (let i = 0; i < 10; i++) {
      if (i === colIndex) continue;
      if (gameState.columns[i].cards.length === 0) {
        onMove(colIndex, i, cardIndex);
        return;
      }
    }
  }, [gameState, onMove]);

  // Вычисление смещения карт
  const getCardOffset = (totalCards: number, index: number): number => {
    const availableHeight = Math.max(300, boardHeight - 180);
    const maxOffset = 28;
    const minOffset = 14;
    const cardHeight = 70; // approximate card height
    const maxStackHeight = availableHeight - cardHeight;
    const offset = totalCards > 1 
      ? Math.min(maxOffset, Math.max(minOffset, maxStackHeight / (totalCards - 1)))
      : 0;
    return index * offset;
  };

  return (
    <div
      ref={boardRef}
      className="game-board"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{ touchAction: dragState ? 'none' : 'auto' }}
    >
      <div className="columns-container">
        {gameState.columns.map((column, colIndex) => (
          <div
            key={colIndex}
            ref={el => { columnRefs.current[colIndex] = el; }}
            className={`column ${dropTarget === colIndex ? 'column-drop-target' : ''} ${
              hint?.toColumn === colIndex ? 'column-hint-target' : ''
            } ${selectedCard?.column === colIndex ? 'column-selected' : ''}`}
            onClick={() => handleColumnClick(colIndex)}
          >
            {column.cards.length === 0 && (
              <div className="column-empty-placeholder" />
            )}
            {column.cards.map((card, cardIndex) => {
              const isDragging = dragState?.isDragging && 
                dragState.fromColumn === colIndex && 
                cardIndex >= dragState.cardIndex;
              
              const isSelected = selectedCard?.column === colIndex && 
                cardIndex >= selectedCard.index;
              
              const isHintSource = hint?.fromColumn === colIndex && 
                cardIndex >= hint.cardIndex;

              return (
                <div
                  key={card.id}
                  className={`card-wrapper ${isDragging ? 'card-dragging' : ''}`}
                  style={{
                    top: `${getCardOffset(column.cards.length, cardIndex)}px`,
                    zIndex: cardIndex + 1,
                    opacity: isDragging ? 0.3 : 1,
                  }}
                >
                  <CardComponent
                    card={card}
                    isHighlighted={isSelected}
                    isHint={isHintSource}
                    onClick={() => {
                      if (card.faceUp) {
                        handleCardClick(colIndex, cardIndex);
                      }
                    }}
                    onPointerDown={(e) => {
                      if (card.faceUp) {
                        handlePointerDown(e, colIndex, cardIndex);
                      }
                    }}
                    onDoubleClick={() => {
                      if (card.faceUp) {
                        handleDoubleClick(colIndex, cardIndex);
                      }
                    }}
                  />
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Перетаскиваемые карты */}
      {dragState?.isDragging && (
        <div
          className="drag-preview"
          style={{
            left: dragState.currentX - 35,
            top: dragState.currentY - 20,
          }}
        >
          {dragState.cards.map((card, i) => (
            <div
              key={card.id}
              className="drag-card"
              style={{ top: `${i * 25}px` }}
            >
              <CardComponent card={card} />
            </div>
          ))}
        </div>
      )}

      {/* Резерв */}
      <div className="stock-area">
        <div className="stock-info">
          <span className="stock-count">{Math.ceil(gameState.stock.length / 10)} раздач</span>
        </div>
        <button
          className={`stock-pile ${gameState.stock.length === 0 ? 'stock-empty' : ''}`}
          onClick={onDeal}
          disabled={gameState.stock.length === 0}
          aria-label="Раздать карты из резерва"
        >
          {gameState.stock.length > 0 && (
            <div className="stock-cards">
              {Array.from({ length: Math.min(5, Math.ceil(gameState.stock.length / 10)) }).map((_, i) => (
                <div key={i} className="stock-card-mini" style={{ left: `${i * 2}px`, top: `${i * 2}px` }} />
              ))}
            </div>
          )}
          {gameState.stock.length === 0 && <span className="stock-empty-text">Пусто</span>}
        </button>
      </div>

      {/* Завершённые комплекты */}
      <div className="completed-area">
        {gameState.completedSets.map((set, i) => (
          <div key={i} className="completed-set">
            <CardComponent card={{ ...set[0], faceUp: true }} />
          </div>
        ))}
        {Array.from({ length: 8 - gameState.completedSets.length }).map((_, i) => (
          <div key={`empty-${i}`} className="completed-slot" />
        ))}
      </div>
    </div>
  );
};
