#!/bin/bash

# Скрипт для загрузки всех 52 SVG-карт из OpenDecks
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
    
    # Скачиваем файл с проверкой
    if curl -s -L --fail "$url" -o "$output" 2>/dev/null; then
      # Проверяем, что файл не пустой
      if [ ! -s "$output" ]; then
        echo ""
        echo "  ⚠ Файл пуст: $filename"
        rm -f "$output"
        failed=$((failed + 1))
        continue
      fi
      
      # Проверяем, что это валидный SVG
      if ! grep -q "<svg" "$output" 2>/dev/null; then
        echo ""
        echo "  ⚠ Файл не является SVG: $filename"
        rm -f "$output"
        failed=$((failed + 1))
        continue
      fi
      
      # Проверяем, что это не HTML страница ошибки
      if grep -q "<!DOCTYPE html>" "$output" 2>/dev/null; then
        echo ""
        echo "  ⚠ Файл содержит HTML (возможно 404): $filename"
        rm -f "$output"
        failed=$((failed + 1))
        continue
      fi
      
      success=$((success + 1))
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

# Проверяем структуру
echo "Проверка структуры файлов:"
for suit in "${SUITS[@]}"; do
  count=$(ls -1 "public/cards/${suit}/"*.svg 2>/dev/null | wc -l)
  echo "  ${suit}: ${count} файлов"
done
echo ""

if [ $success -eq 52 ]; then
  echo "✅ Все 52 карты успешно загружены!"
  echo ""
  echo "Следующие шаги:"
  echo "1. Запустите проект: npm run dev"
  echo "2. Откройте http://localhost:3000/card-preview для проверки карт"
  echo "3. Карты должны отображаться с оригинальными изображениями OpenDecks"
else
  echo "⚠️  Не все карты были загружены успешно."
  echo "Проверьте интернет-соединение и повторите попытку."
  echo ""
  echo "Если проблема сохраняется, попробуйте:"
  echo "1. Проверить доступность GitHub"
  echo "2. Использовать VPN если GitHub заблокирован"
  echo "3. Скачать карты вручную с https://github.com/hhonbo/OpenDecks-Public-Domain-and-CC0-Playing-Cards"
fi

echo ""
echo "Лицензия: CC0 1.0 Universal (Public Domain)"
echo "Источник: https://github.com/hhonbo/OpenDecks-Public-Domain-and-CC0-Playing-Cards"
