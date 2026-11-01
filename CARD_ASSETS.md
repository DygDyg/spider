# Инструкции по загрузке SVG карт

## Источник карт

SVG карты загружены из репозитория **Public Domain and CC0 Playing Cards** (CC0 Public Domain):
- GitHub: https://github.com/AustinGabriel/Public-Domain-and-CC0-Playing-Cards
- Лицензия: CC0 1.0 Universal (Public Domain)
- Формат: SVG (векторная графика)

## Структура файлов

Карты организованы по мастям в папке `public/cards/svg/`:

```
public/cards/svg/
├── spades/
│   ├── ace of spades.svg
│   ├── 2 of spades.svg
│   ├── 3 of spades.svg
│   ├── ...
│   ├── 10 of spades.svg
│   ├── jack of spades.svg
│   ├── queen of spades.svg
│   └── king of spades.svg
├── hearts/
│   ├── ace of hearts.svg
│   ├── 2 of hearts.svg
│   └── ... (аналогично)
├── diamonds/
│   ├── ace of diamonds.svg
│   ├── 2 of diamonds.svg
│   └── ... (аналогично)
└── clubs/
    ├── ace of clubs.svg
    ├── 2 of clubs.svg
    └── ... (аналогично)
```

## Как загрузить карты

### Способ 1: Скачать весь репозиторий

```bash
# Клонируем репозиторий
git clone https://github.com/AustinGabriel/Public-Domain-and-CC0-Playing-Cards.git

# Копируем SVG файлы в проект
cp -r "Public-Domain-and-CC0-Playing-Cards/svg cards/card fronts/spades" public/cards/svg/
cp -r "Public-Domain-and-CC0-Playing-Cards/svg cards/card fronts/hearts" public/cards/svg/
cp -r "Public-Domain-and-CC0-Playing-Cards/svg cards/card fronts/diamonds" public/cards/svg/
cp -r "Public-Domain-and-CC0-Playing-Cards/svg cards/card fronts/clubs" public/cards/svg/
```

### Способ 2: Скачать отдельные файлы

Вы можете скачать только нужные файлы через GitHub API или веб-интерфейс:

1. Перейдите на https://github.com/AustinGabriel/Public-Domain-and-CC0-Playing-Cards
2. Откройте папку `svg cards/card fronts/`
3. Выберите нужную масть (spades, hearts, diamonds, clubs)
4. Скачайте SVG файлы

### Способ 3: Использовать скрипт для автоматической загрузки

Создайте файл `download-cards.sh`:

```bash
#!/bin/bash

# Базовый URL репозитория
BASE_URL="https://raw.githubusercontent.com/AustinGabriel/Public-Domain-and-CC0-Playing-Cards/main/svg%20cards/card%20fronts"

# Масти
SUITS=("spades" "hearts" "diamonds" "clubs")

# Ранги
RANKS=("ace" "2" "3" "4" "5" "6" "7" "8" "9" "10" "jack" "queen" "king")

# Создаём директории
mkdir -p public/cards/svg/{spades,hearts,diamonds,clubs}

# Скачиваем файлы
for suit in "${SUITS[@]}"; do
  for rank in "${RANKS[@]}"; do
    filename="${rank} of ${suit}.svg"
    url="${BASE_URL}/${suit}/${filename}"
    output="public/cards/svg/${suit}/${filename}"
    
    echo "Downloading: $filename"
    curl -L "$url" -o "$output"
  done
done

echo "Download complete!"
```

Запуск:
```bash
chmod +x download-cards.sh
./download-cards.sh
```

## Настройка цветов

Цвета мастей настраиваются через CSS-переменные в `src/index.css`:

```css
:root {
  /* Светлая тема */
  --suit-color-spades: #1a1a2e;
  --suit-color-clubs: #1a1a2e;
  --suit-color-hearts: #dc2626;
  --suit-color-diamonds: #dc2626;
}

[data-theme="dark"] {
  /* Тёмная тема: чёрные масти становятся серебристо-голубыми */
  --suit-color-spades: #A8C7FA;
  --suit-color-clubs: #A8C7FA;
  --suit-color-hearts: #FF6B6B;
  --suit-color-diamonds: #FF6B6B;
}
```

## Компонент SVGCard

Компонент `src/components/Card/SVGCard.tsx` автоматически:
1. Загружает SVG файл из `public/cards/svg/`
2. Заменяет цвета на текущие значения CSS-переменных
3. Рендерит карту с правильными цветами для выбранной темы

## Преимущества SVG формата

- **Масштабируемость**: карты остаются чёткими при любом размере
- **Настраиваемость**: цвета можно менять через CSS
- **Малый размер**: SVG файлы компактнее растровых изображений
- **Редактируемость**: можно модифицировать в векторных редакторах

## Лицензия

Все карты из репозитория Public Domain and CC0 Playing Cards распространяются под лицензией **CC0 1.0 Universal (Public Domain)**.

Это означает:
- ✅ Свободное использование в коммерческих и некоммерческих проектах
- ✅ Модификация и распространение
- ✅ Не требуется указание авторства (хотя приветствуется)
- ✅ Нет ограничений на использование

## Альтернативные источники

Если вам нужны другие стили карт, рассмотрите:

1. **RevK SVG Playing Cards** (CC0)
   - https://www.me.uk/cards/
   - Более классический дизайн
   - API для генерации карт

2. **OpenGameArt Playing Cards** (CC0)
   - https://opengameart.org/content/playing-cards-vector-png
   - Векторные карты в стиле solitaire

## Troubleshooting

### Карты не загружаются

1. Проверьте, что файлы находятся в `public/cards/svg/`
2. Убедитесь, что имена файлов соответствуют формату: `{rank} of {suit}.svg`
3. Проверьте консоль браузера на ошибки загрузки

### Цвета не меняются

1. Убедитесь, что CSS-переменные определены в `src/index.css`
2. Проверьте, что компонент передаёт правильный параметр `isDarkTheme`
3. Очистите кэш браузера

### SVG файлы слишком большие

Фигурные карты (J, Q, K) могут быть довольно большими (300-600 KB). Для оптимизации:
- Используйте инструменты сжатия SVG (SVGO, SVGOMG)
- Рассмотрите использование более простых стилей карт
- Загружайте карты лениво (lazy loading)
