import React, { useState, useRef, useCallback, useEffect } from 'react';
import { GameState, Hint, Card as CardType, Settings } from '../../game/types';
import { isValidSequence, canPlaceCards } from '../../game/engine';
import { CardComponent } from '../Card/Card';
import { flipAnimator } from '../../services/FlipAnimator';
import { audioManager } from '../../services/AudioManager';
import { AnimationState } from '../../hooks/useGame';

interface GameBoardProps {
  gameState: GameState;
  hint: Hint | null;
  settings: Settings;
  animationState: AnimationState;
  dealId: string | null;
  onMove: (from: number, to: number, cardIndex: number) => boolean;
  onDeal: () => void;
  onCompleteAnimation: () => void;
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
  animationState,
  dealId,
  onMove,
  onDeal,
  onCompleteAnimation,
  canDeal: canDealProp,
}) => {
  const [selectedCard, setSelectedCard] = useState<{ column: number; index: number } | null>(null);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [dropTarget, setDropTarget] = useState<number | null>(null);
  const [boardHeight, setBoardHeight] = useState(600);
  const [arrowCoords, setArrowCoords] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);
  const [isDealing, setIsDealing] = useState(false);
  const [dealtCardIds, setDealtCardIds] = useState<Set<string>>(new Set());
  const [stockDealCardIds, setStockDealCardIds] = useState<Set<string>>(new Set());
  const boardRef = useRef<HTMLDivElement>(null);
  const columnRefs = useRef<(HTMLDivElement | null)[]>([]);
  const prevGameStateRef = useRef<GameState | null>(null);
  const prevDealIdRef = useRef<string | null>(null);

  // Вычисление смещения карт
  const getCardOffset = (totalCards: number, index: number): number => {
    const availableHeight = Math.max(300, boardHeight - 180);
    const maxOffset = 28;
    const minOffset = 14;
    // Вычисляем высоту карты на основе ширины и фиксированного aspect-ratio (5:7)
    const cardWidth = columnRefs.current[0]?.clientWidth || 70;
    const cardHeight = cardWidth * 7 / 5;
    const maxStackHeight = availableHeight - cardHeight;
    const offset = totalCards > 1 
      ? Math.min(maxOffset, Math.max(minOffset, maxStackHeight / (totalCards - 1)))
      : 0;
    return index * offset;
  };

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

  // Вычисляем координаты стрелки подсказки
  useEffect(() => {
    if (!hint) {
      setArrowCoords(null);
      return;
    }

    const updateArrow = () => {
      const sourceEl = columnRefs.current[hint.fromColumn];
      const targetEl = columnRefs.current[hint.toColumn];
      
      if (!sourceEl || !targetEl) {
        setArrowCoords(null);
        return;
      }

      const sourceRect = sourceEl.getBoundingClientRect();
      const targetRect = targetEl.getBoundingClientRect();

      // Исходная точка: центр верхней карты источника
      const sourceCol = gameState.columns[hint.fromColumn];
      const cardHeight = sourceEl.clientWidth * 7 / 5; // aspect ratio 5:7
      const cardOffset = getCardOffset(sourceCol.cards.length, hint.cardIndex);
      
      const x1 = sourceRect.left + sourceRect.width / 2;
      const y1 = sourceRect.top + cardOffset + cardHeight / 2;

      // Целевая точка: верх целевой колонки (место куда ляжет карта)
      const targetCol = gameState.columns[hint.toColumn];
      const targetCardOffset = targetCol.cards.length > 0 
        ? getCardOffset(targetCol.cards.length, targetCol.cards.length)
        : 0;
      
      const x2 = targetRect.left + targetRect.width / 2;
      const y2 = targetRect.top + targetCardOffset + 10;

      setArrowCoords({ x1, y1, x2, y2 });
    };

    updateArrow();
    window.addEventListener('resize', updateArrow);
    window.addEventListener('scroll', updateArrow);
    
    return () => {
      window.removeEventListener('resize', updateArrow);
      window.removeEventListener('scroll', updateArrow);
    };
  }, [hint, gameState, boardHeight]);

  // FLIP-анимация при изменении gameState
  useEffect(() => {
    if (!boardRef.current) return;

    const prevState = prevGameStateRef.current;
    const prevDealId = prevDealIdRef.current;
    
    // Обновляем refs
    prevGameStateRef.current = gameState;
    prevDealIdRef.current = dealId;

    // Проверяем, изменился ли dealId - это новая игра
    if (dealId && dealId !== prevDealId) {
      // Новая игра - запускаем первоначальную раздачу
      if (settings.animations && settings.dealAnimation && animationState === 'initial-deal') {
        animateInitialDeal(dealId);
      } else {
        // Анимации отключены или это восстановление сохранённой игры
        onCompleteAnimation();
      }
      return;
    }

    // Если нет предыдущего состояния - ничего не анимируем
    if (!prevState) return;

    // Проверяем раздачу из резерва
    const stockDecreased = gameState.stock.length < prevState.stock.length;
    if (stockDecreased && animationState === 'stock-deal') {
      // Находим новые карты (те, которых не было в prevState)
      const prevCardIds = new Set<string>();
      prevState.columns.forEach(col => col.cards.forEach(card => prevCardIds.add(card.id)));
      
      const newCardIds: string[] = [];
      gameState.columns.forEach(col => {
        col.cards.forEach(card => {
          if (!prevCardIds.has(card.id)) {
            newCardIds.push(card.id);
          }
        });
      });
      
      if (settings.animations && settings.dealAnimation) {
        animateStockDeal(newCardIds);
      } else {
        onCompleteAnimation();
      }
      return;
    }

    // Проверяем переворот карт
    if (settings.animations) {
      checkCardFlips(prevState, gameState);
    }

    // Проверяем завершение последовательности
    const sequenceCompleted = gameState.completedSets.length > prevState.completedSets.length;
    if (sequenceCompleted && settings.animations && settings.completeAnimation) {
      animateSequenceComplete();
    }

    // Проверяем победу
    if (gameState.gameWon && settings.animations) {
      animateVictory();
    }

    // Захватываем позиции ДО изменения
    flipAnimator.capturePositions(boardRef.current);

    // Сохраняем текущее состояние как предыдущее
    prevGameStateRef.current = gameState;

    // После перерисовки React — анимируем перемещения
    requestAnimationFrame(() => {
      if (!boardRef.current) return;

      const cardElements = boardRef.current.querySelectorAll('[data-card-id]');
      cardElements.forEach((el) => {
        const id = el.getAttribute('data-card-id');
        if (!id) return;

        const savedPos = flipAnimator.getPosition(id);
        if (!savedPos) return;

        const rect = el.getBoundingClientRect();
        const deltaX = savedPos.x - rect.left;
        const deltaY = savedPos.y - rect.top;

        // Если карта переместилась — анимируем
        if (Math.abs(deltaX) > 1 || Math.abs(deltaY) > 1) {
          flipAnimator.animateCardMove(
            el as HTMLElement,
            savedPos.x,
            savedPos.y,
            rect.left,
            rect.top,
            250
          );
        }
      });
    });
  }, [gameState, settings, animationState, dealId, onCompleteAnimation]);

  // Проверка переворота карт
  const checkCardFlips = useCallback((prevState: GameState, newState: GameState) => {
    for (let colIdx = 0; colIdx < 10; colIdx++) {
      const prevCol = prevState.columns[colIdx];
      const newCol = newState.columns[colIdx];
      
      for (let cardIdx = 0; cardIdx < newCol.cards.length; cardIdx++) {
        const prevCard = prevCol.cards[cardIdx];
        const newCard = newCol.cards[cardIdx];
        
        if (prevCard && !prevCard.faceUp && newCard.faceUp) {
          // Карта перевернулась — анимируем
          const cardEl = boardRef.current?.querySelector(`[data-card-id="${newCard.id}"]`);
          if (cardEl) {
            cardEl.classList.add('flipping');
            audioManager.play('cardFlip');
            setTimeout(() => {
              cardEl.classList.remove('flipping');
            }, 400);
          }
        }
      }
    }
  }, []);

  // Анимация раздачи из резерва
  const animateStockDeal = useCallback(async (newCardIds: string[]) => {
    if (!boardRef.current) return;
    
    setIsDealing(true);
    setStockDealCardIds(new Set(newCardIds));
    
    // Находим позицию колоды (stock area)
    const stockEl = boardRef.current.querySelector('.stock-pile');
    const stockRect = stockEl?.getBoundingClientRect();
    const fromX = stockRect?.left || 50;
    const fromY = stockRect?.top || window.innerHeight - 150;

    // Анимируем только новые карты
    const promises: Promise<void>[] = [];
    newCardIds.forEach((cardId, index) => {
      const cardEl = boardRef.current?.querySelector(`[data-card-id="${cardId}"]`);
      if (!cardEl) return;
      
      const htmlEl = cardEl as HTMLElement;
      const rect = htmlEl.getBoundingClientRect();
      
      const delay = index * 50; // 50ms между картами
      
      const promise = new Promise<void>((resolve) => {
        setTimeout(() => {
          flipAnimator.animateCardDeal(
            htmlEl,
            fromX,
            fromY,
            rect.left,
            rect.top,
            300
          ).then(resolve);
          
          audioManager.play('cardPlace');
        }, delay);
      });
      
      promises.push(promise);
    });

    await Promise.all(promises);
    setStockDealCardIds(new Set());
    setIsDealing(false);
    onCompleteAnimation();
  }, [settings, onCompleteAnimation]);

  // Анимация первоначальной раздачи
  const animateInitialDeal = useCallback(async (currentDealId: string) => {
    if (!boardRef.current) return;
    
    // Проверяем, что dealId всё ещё актуален
    if (currentDealId !== dealId) return;
    
    setIsDealing(true);
    
    // Собираем все ID карт из gameState
    const allCardIds: string[] = [];
    gameState.columns.forEach(col => {
      col.cards.forEach(card => {
        allCardIds.push(card.id);
      });
    });
    
    // Находим позицию колоды (stock area)
    const stockEl = boardRef.current.querySelector('.stock-pile');
    const stockRect = stockEl?.getBoundingClientRect();
    const fromX = stockRect?.left || 50;
    const fromY = stockRect?.top || window.innerHeight - 150;

    // Анимируем каждую карту с задержкой
    const promises: Promise<void>[] = [];
    allCardIds.forEach((cardId, index) => {
      const cardEl = boardRef.current?.querySelector(`[data-card-id="${cardId}"]`);
      if (!cardEl) return;
      
      const htmlEl = cardEl as HTMLElement;
      const rect = htmlEl.getBoundingClientRect();
      
      const delay = index * 40; // 40ms между картами
      
      const promise = new Promise<void>((resolve) => {
        setTimeout(() => {
          // Проверяем, что dealId всё ещё актуален
          if (currentDealId !== dealId) {
            resolve();
            return;
          }
          
          flipAnimator.animateCardDeal(
            htmlEl,
            fromX,
            fromY,
            rect.left,
            rect.top,
            300
          ).then(resolve);
          
          audioManager.play('cardDeal');
        }, delay);
      });
      
      promises.push(promise);
    });

    await Promise.all(promises);
    
    // Проверяем, что dealId всё ещё актуален
    if (currentDealId !== dealId) return;
    
    setIsDealing(false);
    onCompleteAnimation();
  }, [settings, dealId, gameState, onCompleteAnimation]);

  // Анимация завершения последовательности
  const animateSequenceComplete = useCallback(async () => {
    if (!boardRef.current) return;
    
    // Находим область завершённых комплектов
    const completedArea = boardRef.current.querySelector('.completed-area');
    const completedRect = completedArea?.getBoundingClientRect();
    const targetX = completedRect?.left || window.innerWidth - 100;
    const targetY = completedRect?.top || window.innerHeight - 150;

    // Получаем все карты из последней завершённой последовательности
    // (они уже удалены из gameState, но мы можем анимировать последние видимые карты)
    const cardElements = boardRef.current.querySelectorAll('[data-card-id]');
    
    // Находим 13 карт одной масти (последовательность)
    // Для простоты анимируем последние видимые карты
    const lastCards = Array.from(cardElements).slice(-13);
    
    if (lastCards.length > 0) {
      audioManager.play('sequenceComplete');
      
      await flipAnimator.animateSequenceComplete(
        lastCards as unknown as HTMLElement[],
        targetX,
        targetY,
        400
      );
    }
  }, []);

  // Победная анимация
  const animateVictory = useCallback(async () => {
    if (!boardRef.current) return;
    
    audioManager.play('victory');
    
    const cardElements = boardRef.current.querySelectorAll('[data-card-id]');
    if (cardElements.length > 0) {
      await flipAnimator.animateVictory(Array.from(cardElements) as unknown as HTMLElement[]);
    }
  }, []);

  // Синхронизация настроек анимации с FlipAnimator
  useEffect(() => {
    flipAnimator.setEnabled(settings.animations);
    flipAnimator.setSpeed(settings.animationSpeed);
  }, [settings.animations, settings.animationSpeed]);

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
    if (gameState.gameOver || animationState !== 'idle') return;
    
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
                  data-card-id={card.id}
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
                    isDarkTheme={settings.theme === 'dark'} cardDeck={settings.cardDeck}
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
              <CardComponent card={card} isDarkTheme={settings.theme === 'dark'} cardDeck={settings.cardDeck} />
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

      {/* Стрелка подсказки */}
      {hint && arrowCoords && (
        <svg className="hint-arrow" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          pointerEvents: 'none',
          zIndex: 999,
        }}>
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" className="hint-arrow-head" />
            </marker>
          </defs>
          <line
            x1={arrowCoords.x1}
            y1={arrowCoords.y1}
            x2={arrowCoords.x2}
            y2={arrowCoords.y2}
            className="hint-arrow-line"
            markerEnd="url(#arrowhead)"
          />
        </svg>
      )}

      {/* Завершённые комплекты */}
      <div className="completed-area">
        {gameState.completedSets.map((set, i) => (
          <div key={i} className="completed-set">
            <CardComponent card={{ ...set[0], faceUp: true }} isDarkTheme={settings.theme === 'dark'} cardDeck={settings.cardDeck} />
          </div>
        ))}
        {Array.from({ length: 8 - gameState.completedSets.length }).map((_, i) => (
          <div key={`empty-${i}`} className="completed-slot" />
        ))}
      </div>
    </div>
  );
};
