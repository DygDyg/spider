#!/bin/bash

# Скрипт для загрузки всех 52 SVG-карт из OpenDecks
# Источник: https://github.com/hhonbo/OpenDecks-Public-Domain-and-CC0-Playing-Cards
# Лицензия: CC0 1.0 Universal (Public Domain)

set -e

echo "=== Загрузка SVG карт из OpenDecks ==="
echo ""

BASE_URL="https://raw.githubusercontent.com/hhonbo/OpenDecks-Public-Domain-and-CC0-Playing-Cards/main/svg%20cards/card%20fronts"

# Масти
SUITS=("spades" "hearts" "diamonds" "clubs")

# Ранги
RANKS=("ace" "2" "3" "4" "5" "6" "7" "8" "9" "10" "jack" "queen" "king")

# Создаём директории
echo "Создание директорий..."
mkdir -p public/cards/{spades,hearts,diamonds,clubs}

# Счётчики
total=$((${#SUITS[@]} * ${#RANKS[@]}))
current=0
success=0
failed=0

# Скачиваем файлы
echo "Загрузка $total SVG файлов..."
echo ""

for suit in "${SUITS[@]}"; do
  echo "Загрузка масти: $suit"
  for rank in "${RANKS[@]}"; do
    filename="${rank} of ${suit}.svg"
    url="${BASE_URL}/${suit}/${filename}"
    output="public/cards/${suit}/${filename}"
    
    current=$((current + 1))
    progress=$((current * 100 / total))
    
    printf "  [%3d%%] %s\r" "$progress" "$filename"
    
    # Скачиваем файл
    if curl -s -L "$url" -o "$output" 2>/dev/null; then
      # Проверяем, что файл не пустой и является валидным SVG
      if [ -s "$output" ] && grep -q "<svg" "$output" 2>/dev/null; then
        success=$((success + 1))
      else
        echo ""
        echo "  ⚠ Файл повреждён или пуст: $filename"
        rm -f "$output"
        failed=$((failed + 1))
      fi
    else
      echo ""
      echo "  ⚠ Ошибка загрузки: $filename"
      failed=$((failed + 1))
    fi
  done
  echo ""
done

echo ""
echo "=== Загрузка завершена! ==="
echo ""
echo "Результат:"
echo "  ✓ Успешно загружено: $success"
echo "  ✗ Ошибок: $failed"
echo "  📁 Всего файлов: $total"
echo ""
echo "Файлы сохранены в: public/cards/"
echo ""
echo "Структура:"
echo "  public/cards/"
echo "  ├── spades/     (13 файлов)"
echo "  ├── hearts/     (13 файлов)"
echo "  ├── diamonds/   (13 файлов)"
echo "  └── clubs/      (13 файлов)"
echo ""

if [ $success -eq 52 ]; then
  echo "✅ Все 52 карты успешно загружены!"
  echo ""
  echo "Следующие шаги:"
  echo "1. Проверьте наличие файлов: ls -la public/cards/spades/"
  echo "2. Запустите проект: npm run dev"
  echo "3. Карты должны отображаться с оригинальными изображениями OpenDecks"
else
  echo "⚠️  Не все карты были загружены успешно."
  echo "Проверьте интернет-соединение и повторите попытку."
fi

echo ""
echo "Лицензия: CC0 1.0 Universal (Public Domain)"
echo "Источник: https://github.com/hhonbo/OpenDecks-Public-Domain-and-CC0-Playing-Cards"
