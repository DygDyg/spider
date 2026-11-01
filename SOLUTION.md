# Решение проблемы "Card not found"

## Текущее состояние

### Проблема
В проекте находится только один SVG-файл: `public/cards/spades/ace of spades.svg`

Компонент `OpenDecksCard.tsx` пытается загрузить 52 файла, но находит только один, поэтому показывает "Card not found" для остальных 51 карт.

### Решение: Fallback на встроенные SVG

**Реализовано в `src/components/Card/OpenDecksCard.tsx`:**

1. **Кеширование загруженных SVG** - каждый файл загружается только один раз
2. **AbortController** - корректная отмена запросов при размонтировании
3. **Fallback на встроенные SVG** - если внешний файл не найден, используется `CardFace.tsx`
4. **Детальные ошибки в консоли** - в режиме разработки показывается URL и статус ошибки

### Как это работает

```typescript
// 1. Пытаемся загрузить внешний SVG
try {
  const response = await fetch(svgPath);
  const svgText = await response.text();
  // Используем загруженный SVG
} catch (err) {
  // 2. Если не удалось - используем fallback
  console.warn(`SVG not found: ${svgPath}, using fallback`);
  setUseFallback(true);
}

// 3. Fallback рендерит встроенный CardFace
if (useFallback) {
  return (
    <svg viewBox="0 0 100 140">
      <CardFace suit={card.suit} rank={card.rank} color={fallbackColor} />
    </svg>
  );
}
```

## Результат

✅ **Игра работает немедленно** - не нужно ждать загрузки 52 файлов
✅ **Нет ошибок "Card not found"** - все карты отображаются через fallback
✅ **Предупреждения в консоли** - видно, какие файлы отсутствуют
✅ **Готовность к OpenDecks** - если загрузить файлы, они будут использованы автоматически

## Что нужно сделать для использования OpenDecks

### Шаг 1: Загрузить SVG-файлы

```bash
chmod +x download-opendecks.sh
./download-opendecks.sh
```

Это загрузит все 52 SVG-файла из репозитория OpenDecks.

### Шаг 2: Проверить загрузку

```bash
npx tsx scripts/check-cards.ts
```

Скрипт проверит наличие и валидность всех 52 файлов.

### Шаг 3: Перезапустить игру

```bash
npm run dev
```

Теперь игра будет использовать оригинальные SVG из OpenDecks.

## Альтернативные варианты

### Вариант 1: Ручная загрузка

Если скрипт не работает, скачайте карты вручную:

1. Откройте https://github.com/hhonbo/OpenDecks-Public-Domain-and-CC0-Playing-Cards
2. Перейдите в `svg cards/card fronts/`
3. Для каждой масти скачайте все 13 SVG файлов
4. Поместите в `public/cards/{suit}/`

### Вариант 2: Использовать другой источник

Если OpenDecks недоступен, можно использовать другой набор SVG-карт с лицензией CC0 или MIT.

## Проверка сборки

```bash
npm run build
```

Сборка проходит успешно. Все 52 карты будут отображаться через fallback, если внешние файлы не загружены.

## Структура проекта

```
src/components/Card/
├── Card.tsx              # Основной компонент карты
├── OpenDecksCard.tsx     # Загрузка внешних SVG с fallback
├── CardFace.tsx          # Встроенные SVG (fallback)
└── cardSVGs.ts           # Генерация SVG для числовых и фигурных карт

public/cards/
├── spades/
│   └── ace of spades.svg # Единственный загруженный файл
├── hearts/               # Пусто (нужно загрузить)
├── diamonds/             # Пусто (нужно загрузить)
└── clubs/                # Пусто (нужно загрузить)

scripts/
├── check-cards.ts        # Проверка наличия 52 файлов
└── check-cards.sh        # Bash-версия проверки
```

## Технические детали

### Кеширование

```typescript
const svgCache = new Map<string, string>();

// Проверяем кэш перед загрузкой
if (svgCache.has(cacheKey)) {
  setSvgContent(svgCache.get(cacheKey)!);
  return;
}

// Сохраняем в кэш после загрузки
svgCache.set(cacheKey, svgText);
```

### Отмена запросов

```typescript
const abortControllerRef = useRef<AbortController | null>(null);

useEffect(() => {
  abortControllerRef.current = new AbortController();
  
  const loadSVG = async () => {
    const response = await fetch(svgPath, {
      signal: abortControllerRef.current?.signal,
    });
    // ...
  };
  
  loadSVG();
  
  return () => {
    abortControllerRef.current?.abort();
  };
}, [card.suit, card.rank, isDarkTheme]);
```

### Fallback рендеринг

```typescript
if (useFallback) {
  const isBlackSuit = card.suit === 'spades' || card.suit === 'clubs';
  const fallbackColor = isDarkTheme
    ? (isBlackSuit ? '#A8C7FA' : '#FF6B6B')
    : (isBlackSuit ? '#1a1a2e' : '#dc2626');

  return (
    <svg viewBox="0 0 100 140" preserveAspectRatio="xMidYMid meet">
      <rect x="0" y="0" width="100" height="140" rx="6" fill="#fffef7" />
      <CardFace suit={card.suit} rank={card.rank} color={fallbackColor} />
    </svg>
  );
}
```

## Проверка в консоли браузера

Откройте DevTools → Console и вы увидите:

```
⚠️ SVG card not found: /spider/cards/spades/2 of spades.svg
Error: HTTP 404: Not Found
Using fallback rendering for 2 of spades
```

Это нормально, пока не загружены внешние файлы.

## Итог

✅ Проблема "Card not found" решена через fallback
✅ Игра работает немедленно без загрузки 52 файлов
✅ Готовность к использованию OpenDecks при загрузке файлов
✅ Кеширование и отмена запросов реализованы
✅ Детальные ошибки в консоли для отладки
✅ Проверка наличия файлов через скрипт

**Для использования оригинальных OpenDecks SVG необходимо загрузить 52 файла через `download-opendecks.sh`.**
