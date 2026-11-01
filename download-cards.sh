#!/bin/bash

# Скрипт для загрузки SVG карт из репозитория OpenDecks
# Источник: https://github.com/hhonbo/OpenDecks-Public-Domain-and-CC0-Playing-Cards
# Лицензия: CC0 1.0 Universal (Public Domain)

set -e

echo "=== Загрузка SVG карт из OpenDecks ==="
echo ""

# Базовый URL репозитория OpenDecks
BASE_URL="https://raw.githubusercontent.com/hhonbo/OpenDecks-Public-Domain-and-CC0-Playing-Cards/main/svg%20cards/card%20fronts"

# Масти
SUITS=("spades" "hearts" "diamonds" "clubs")

# Ранги
RANKS=("ace" "2" "3" "4" "5" "6" "7" "8" "9" "10" "jack" "queen" "king")

# Создаём директории
echo "Создание директорий..."
mkdir -p public/cards/svg/{spades,hearts,diamonds,clubs}

# Счётчики
total=$((${#SUITS[@]} * ${#RANKS[@]}))
current=0

# Скачиваем файлы
echo "Загрузка $total SVG файлов..."
echo ""

for suit in "${SUITS[@]}"; do
  echo "Загрузка мастей: $suit"
  for rank in "${RANKS[@]}"; do
    filename="${rank} of ${suit}.svg"
    url="${BASE_URL}/${suit}/${filename}"
    output="public/cards/svg/${suit}/${filename}"
    
    current=$((current + 1))
    progress=$((current * 100 / total))
    
    printf "  [%3d%%] %s\r" "$progress" "$filename"
    
    # Скачиваем файл
    if curl -s -L "$url" -o "$output"; then
      # Файл успешно загружен
      :
    else
      echo ""
      echo "  ⚠ Ошибка загрузки: $filename"
    fi
  done
  echo ""
done

echo ""
echo "=== Загрузка завершена! ==="
echo ""
echo "Файлы сохранены в: public/cards/svg/"
echo ""
echo "Структура:"
echo "  public/cards/svg/"
echo "  ├── spades/     (13 файлов)"
echo "  ├── hearts/     (13 файлов)"
echo "  ├── diamonds/   (13 файлов)"
echo "  └── clubs/      (13 файлов)"
echo ""
echo "Для использования SVG карт в игре:"
echo "1. Убедитесь, что файлы загружены"
echo "2. Передайте useSVG={true} в компонент Card"
echo "3. Цвета автоматически адаптируются к выбранной теме"
echo ""
echo "Лицензия: CC0 1.0 Universal (Public Domain)"
echo "Источник: https://github.com/AustinGabriel/Public-Domain-and-CC0-Playing-Cards"
