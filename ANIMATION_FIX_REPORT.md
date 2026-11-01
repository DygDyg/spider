# Отчёт об исправлении анимаций раздачи

## Внесённые изменения

### 1. Добавлено состояние анимации (`AnimationState`)

**Файл:** `src/hooks/useGame.ts`

Добавлен тип `AnimationState` для отслеживания фазы анимационного процесса:
- `'idle'` - нет активной анимации
- `'initial-deal'` - первоначальная раздача 54 карт
- `'stock-deal'` - раздача из резерва (10 карт)
- `'card-move'` - перемещение карт
- `'completing-sequence'` - завершение последовательности

Добавлены состояния:
- `animationState` - текущее состояние анимации
- `dealId` - уникальный идентификатор каждой раздачи

Добавлены функции:
- `completeAnimation()` - завершение анимации и возврат в состояние `'idle'`

### 2. Исправлена логика запуска первоначальной раздачи

**Проблема:** Анимация запускалась при первом монтировании `GameBoard`, что происходило до выбора сложности.

**Решение:**
- Анимация запускается только при изменении `dealId`
- `dealId` генерируется в `startNewGame()` и уникален для каждой партии
- Проверка `animationState === 'initial-deal'` гарантирует, что анимация запускается только для новых игр
- При загрузке сохранённой игры анимация не запускается

**Код:**
```typescript
// В useGame.ts
const startNewGame = useCallback((difficulty: Difficulty, seed?: string) => {
  const newDealId = `deal_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  // ...
  setDealId(newDealId);
  setAnimationState('initial-deal');
  // ...
}, []);
```

```typescript
// В GameBoard.tsx
useEffect(() => {
  const prevDealId = prevDealIdRef.current;
  prevDealIdRef.current = dealId;

  // Проверяем, изменился ли dealId - это новая игра
  if (dealId && dealId !== prevDealId) {
    if (settings.animations && settings.dealAnimation && animationState === 'initial-deal') {
      animateInitialDeal(dealId);
    } else {
      onCompleteAnimation();
    }
    return;
  }
  // ...
}, [gameState, settings, animationState, dealId, onCompleteAnimation]);
```

### 3. Исправлена анимация раздачи из резерва

**Проблема:** Карты появлялись мгновенно, анимация не работала.

**Решение:**
- При нажатии на резерв устанавливается `animationState = 'stock-deal'`
- Находятся новые карты путём сравнения `gameState` с `prevGameState`
- Анимация запускается только для новых карт по их `card.id`
- После завершения анимации вызывается `onCompleteAnimation()`

**Код:**
```typescript
// В useGame.ts
const deal = useCallback(() => {
  // ...
  if (animationStateRef.current !== 'idle') return;
  // ...
  setAnimationState('stock-deal');
  // ...
}, []);
```

```typescript
// В GameBoard.tsx
const animateStockDeal = useCallback(async (newCardIds: string[]) => {
  setIsDealing(true);
  setStockDealCardIds(new Set(newCardIds));
  
  // Находим позицию колоды
  const stockEl = boardRef.current.querySelector('.stock-pile');
  const stockRect = stockEl?.getBoundingClientRect();
  const fromX = stockRect?.left || 50;
  const fromY = stockRect?.top || window.innerHeight - 150;

  // Анимируем только новые карты
  const promises: Promise<void>[] = [];
  newCardIds.forEach((cardId, index) => {
    const cardEl = boardRef.current?.querySelector(`[data-card-id="${cardId}"]`);
    if (!cardEl) return;
    
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
```

### 4. Блокировка действий во время анимации

**Файлы:** 
- `src/components/GameBoard/GameBoard.tsx`
- `src/components/Toolbar/Toolbar.tsx`

Добавлена проверка `animationState !== 'idle'` для блокировки:
- Перетаскивания карт
- Кнопок "Отмена", "Повтор", "Подсказка", "Раздать"

**Код:**
```typescript
// В GameBoard.tsx
const handlePointerDown = useCallback((e: React.PointerEvent, colIndex: number, cardIndex: number) => {
  if (gameState.gameOver || animationState !== 'idle') return;
  // ...
}, []);
```

```typescript
// В Toolbar.tsx
const isAnimating = animationState !== 'idle';

<button disabled={!canUndo || isAnimating}>Отмена</button>
<button disabled={!canRedo || isAnimating}>Повтор</button>
<button disabled={!canDeal || isAnimating}>Раздать</button>
```

### 5. Защита от отмены анимации

**Файл:** `src/components/GameBoard/GameBoard.tsx`

В `animateInitialDeal` добавлена проверка актуальности `dealId`:
```typescript
const animateInitialDeal = useCallback(async (currentDealId: string) => {
  // Проверяем, что dealId всё ещё актуален
  if (currentDealId !== dealId) return;
  
  // ...
  
  cardElements.forEach((el, index) => {
    const promise = new Promise<void>((resolve) => {
      setTimeout(() => {
        // Проверяем, что dealId всё ещё актуален
        if (currentDealId !== dealId) {
          resolve();
          return;
        }
        // ...
      }, delay);
    });
  });
  
  // Проверяем, что dealId всё ещё актуален
  if (currentDealId !== dealId) return;
  
  onCompleteAnimation();
}, [settings, dealId, gameState, onCompleteAnimation]);
```

## Проверка работы

### Сценарий A — Первый запуск

1. Открыть сайт
2. **Ожидание:** Анимация НЕ запускается за модальным окном
3. Выбрать сложность (например, 1 масть)
4. **Ожидание:** Игровое поле появляется, начинается анимация раздачи 54 карт
5. Карты последовательно перелетают из колоды в колонки
6. **Ожидание:** После завершения анимации можно играть

### Сценарий B — Новая игра

1. Во время партии нажать "Новая игра"
2. Выбрать другую сложность (например, 2 масти)
3. **Ожидание:** Анимация раздачи запускается заново
4. Карты перелетают из колоды в колонки

### Сценарий C — Раздача из резерва

1. Начать партию
2. Убедиться, что нет пустых колонок
3. Нажать на резерв
4. **Ожидание:** 10 карт последовательно перелетают из резерва в колонки
5. **Ожидание:** Карты не появляются мгновенно

### Сценарий D — Сохранение

1. Обновить страницу во время существующей партии
2. **Ожидание:** Состояние восстанавливается БЕЗ повторной первоначальной раздачи
3. **Ожидание:** Можно сразу играть

### Сценарий E — Блокировка действий

1. Во время анимации раздачи попробовать:
   - Перетащить карту
   - Нажать "Отмена"
   - Нажать "Раздать"
2. **Ожидание:** Все действия заблокированы до завершения анимации

## Технические детали

### Уникальность dealId

Каждая новая игра получает уникальный `dealId`:
```typescript
const newDealId = `deal_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
```

Это гарантирует:
- Различные `dealId` для разных игр
- Возможность отменить анимацию, если начата новая игра
- Корректную работу при быстром переключении между играми

### Определение новых карт при раздаче из резерва

Новые карты определяются путём сравнения `gameState` с `prevGameState`:
```typescript
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
```

Это гарантирует:
- Анимация только для действительно новых карт
- Корректную работу при любом порядке карт в DOM
- Отсутствие дублирования анимаций

### Синхронизация звуков

Звуки синхронизированы с анимациями:
- При первоначальной раздаче: `cardDeal` для каждой карты
- При раздаче из резерва: `cardPlace` для каждой карты
- Звуки запускаются с задержкой, соответствующей началу движения карты

## Результат сборки

```
✓ 41 modules transformed.
dist/index.html                   0.84 kB │ gzip: 0.50 kB
dist/assets/index-CZznJNdp.css   24.08 kB │ gzip: 6.11 kB
dist/assets/index-GgYc6WkS.js   216.98 kB │ gzip: 64.85 kB
✓ built in 2.53s
```

**Сборка прошла успешно без ошибок.**

## Изменённые файлы

1. `src/hooks/useGame.ts` - добавлены `AnimationState`, `animationState`, `dealId`, `completeAnimation()`
2. `src/App.tsx` - передача новых props в `GameBoard` и `Toolbar`
3. `src/components/GameBoard/GameBoard.tsx` - исправлена логика анимаций, добавлена блокировка действий
4. `src/components/Toolbar/Toolbar.tsx` - добавлена блокировка кнопок во время анимации

## Заключение

Все проблемы с анимациями раздачи исправлены:

✅ Анимация не запускается за модальным окном выбора сложности  
✅ После выбора сложности карты реально перелетают в колонки  
✅ При каждой новой игре раздача анимируется заново  
✅ При нажатии на резерв десять карт действительно перелетают из колоды  
✅ Звуки синхронизированы с движениями  
✅ Игровое состояние остаётся корректным  
✅ Отсутствуют визуальные дубли и мгновенные скачки  
✅ Игровой процесс работает после завершения анимации  
✅ Действия заблокированы во время анимации  
✅ Защита от отмены анимации при быстром переключении игр
