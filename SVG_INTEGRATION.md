# Интеграция SVG карт в игру

## Быстрый старт

### 1. Загрузите SVG карты

```bash
chmod +x download-cards.sh
./download-cards.sh
```

Это загрузит 52 SVG файла в `public/cards/svg/`.

### 2. Включите режим SVG в коде

В компоненте `GameBoard.tsx` передайте параметр `useSVG`:

```typescript
<CardComponent
  card={card}
  isDarkTheme={settings.theme === 'dark'}
  useSVG={true}  // Включить SVG карты
  // ... остальные props
/>
```

### 3. Настройте цвета (опционально)

Цвета уже настроены в `src/index.css`:

```css
/* Светлая тема */
:root {
  --suit-black: #1a1a2e;  /* Пики, трефы */
  --suit-red: #dc2626;    /* Черви, бубны */
}

/* Тёмная тема */
[data-theme="dark"] {
  --suit-black: #A8C7FA;  /* Серебристо-голубой */
  --suit-red: #FF6B6B;    /* Ярко-красный */
}
```

## Как это работает

### Компонент SVGCard

Компонент `src/components/Card/SVGCard.tsx`:

1. **Загружает SVG файл** из `public/cards/svg/{suit}/{rank} of {suit}.svg`
2. **Парсит SVG** и заменяет цвета на текущие значения CSS-переменных
3. **Рендерит модифицированный SVG** с правильными цветами для выбранной темы

### Замена цветов

Компонент автоматически заменяет цвета в SVG:

```javascript
// Чёрные элементы становятся цветом масти
svgText = svgText.replace(/fill="#000000"/g, `fill="${suitColor}"`);
svgText = svgText.replace(/fill="black"/g, `fill="${suitColor}"`);

// Красные элементы становятся цветом масти
svgText = svgText.replace(/fill="#dc2626"/g, `fill="${suitColor}"`);
svgText = svgText.replace(/fill="red"/g, `fill="${suitColor}"`);
```

### CSS-переменные

Цвета определяются через CSS-переменные, что позволяет:

- **Мгновенно менять тему** - просто измените значения переменных
- **Добавлять новые темы** - создайте новый набор переменных
- **Динамически изменять цвета** - через JavaScript или CSS

## Структура файлов

```
public/cards/svg/
├── spades/
│   ├── ace of spades.svg
│   ├── 2 of spades.svg
│   ├── ...
│   ├── jack of spades.svg
│   ├── queen of spades.svg
│   └── king of spades.svg
├── hearts/
│   ├── ace of hearts.svg
│   ├── ...
│   └── king of hearts.svg
├── diamonds/
│   └── ... (13 файлов)
└── clubs/
    └── ... (13 файлов)
```

## Кастомизация

### Изменение цветов

Откройте `src/index.css` и измените значения:

```css
/* Пример: синяя тема */
[data-theme="blue"] {
  --suit-black: #1e3a8a;  /* Тёмно-синий */
  --suit-red: #ef4444;    /* Ярко-красный */
}
```

### Добавление новой темы

1. Добавьте новую тему в `src/index.css`:

```css
[data-theme="purple"] {
  --bg-primary: #581c87;
  --suit-black: #c084fc;
  --suit-red: #f472b6;
  /* ... остальные переменные */
}
```

2. Добавьте тему в `src/game/types.ts`:

```typescript
export type Theme = 'classic' | 'dark' | 'blue' | 'light' | 'purple';
```

3. Добавьте кнопку переключения в настройки.

### Использование других наборов карт

Если вы хотите использовать другие SVG карты:

1. Поместите файлы в `public/cards/svg/{suit}/`
2. Убедитесь, что имена файлов соответствуют формату: `{rank} of {suit}.svg`
3. Компонент автоматически загрузит и обработает их

## Оптимизация

### Сжатие SVG

SVG файлы могут быть большими (особенно фигурные карты). Для оптимизации:

```bash
# Установите SVGO
npm install -g svgo

# Сожмите все SVG файлы
svgo -f public/cards/svg/spades/
svgo -f public/cards/svg/hearts/
svgo -f public/cards/svg/diamonds/
svgo -f public/cards/svg/clubs/
```

### Ленивая загрузка

Для ускорения начальной загрузки можно загружать карты лениво:

```typescript
const [svgContent, setSvgContent] = useState<string>('');

useEffect(() => {
  // Загружаем SVG только когда карта становится видимой
  if (isVisible) {
    loadSVG();
  }
}, [isVisible]);
```

## Troubleshooting

### Карты не загружаются

1. Проверьте, что файлы находятся в `public/cards/svg/`
2. Убедитесь, что имена файлов в нижнем регистре
3. Проверьте консоль браузера на ошибки CORS

### Цвета не меняются

1. Убедитесь, что CSS-переменные определены в `src/index.css`
2. Проверьте, что тема правильно установлена в `data-theme`
3. Очистите кэш браузера

### SVG отображается некорректно

1. Проверьте валидность SVG файла
2. Убедитесь, что viewBox установлен правильно
3. Попробуйте открыть SVG в браузере напрямую

## Лицензия

SVG карты из репозитория [Public Domain Playing Cards](https://github.com/AustinGabriel/Public-Domain-and-CC0-Playing-Cards) распространяются под лицензией **CC0 1.0 Universal (Public Domain)**.

Это означает:
- ✅ Свободное использование
- ✅ Модификация
- ✅ Коммерческое использование
- ✅ Не требуется указание авторства

## Дополнительные ресурсы

- [Public Domain Playing Cards](https://github.com/AustinGabriel/Public-Domain-and-CC0-Playing-Cards)
- [RevK SVG Playing Cards](https://www.me.uk/cards/)
- [SVGO - SVG Optimizer](https://github.com/svg/svgo)
- [SVGOMG - Online SVG Optimizer](https://jakearchibald.github.io/svgomg/)
