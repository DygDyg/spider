#!/bin/bash

# Скрипт для проверки наличия всех 52 SVG-файлов карт
# Запускается перед сборкой проекта

set -e

echo "🔍 Проверка наличия SVG-файлов карт..."
echo ""

# Определяем базовую директорию
BASE_DIR="public/cards"

# Проверяем существование базовой директории
if [ ! -d "$BASE_DIR" ]; then
  echo "❌ Ошибка: Директория $BASE_DIR не найдена"
  echo ""
  echo "Необходимо загрузить SVG-файлы карт из OpenDecks:"
  echo "  chmod +x download-opendecks.sh"
  echo "  ./download-opendecks.sh"
  exit 1
fi

# Массивы мастей и номиналов
SUITS=("spades" "hearts" "diamonds" "clubs")
RANKS=("ace" "2" "3" "4" "5" "6" "7" "8" "9" "10" "jack" "queen" "king")

# Счётчики
total_expected=52
total_found=0
missing_files=()
invalid_files=()

# Проверяем каждый файл
for suit in "${SUITS[@]}"; do
  suit_dir="$BASE_DIR/$suit"
  
  if [ ! -d "$suit_dir" ]; then
    echo "❌ Директория не найдена: $suit_dir"
    for rank in "${RANKS[@]}"; do
      missing_files+=("$suit/$rank of $suit.svg")
    done
    continue
  fi
  
  for rank in "${RANKS[@]}"; do
    filename="$rank of $suit.svg"
    filepath="$suit_dir/$filename"
    
    if [ ! -f "$filepath" ]; then
      missing_files+=("$suit/$filename")
      continue
    fi
    
    # Проверяем размер файла
    filesize=$(stat -f%z "$filepath" 2>/dev/null || stat -c%s "$filepath" 2>/dev/null || echo "0")
    if [ "$filesize" -lt 100 ]; then
      invalid_files+=("$suit/$filename (слишком маленький: ${filesize} байт)")
      continue
    fi
    
    # Проверяем наличие SVG тега
    if ! grep -q "<svg" "$filepath" 2>/dev/null; then
      invalid_files+=("$suit/$filename (не содержит <svg>)")
      continue
    fi
    
    # Проверяем, что это не HTML страница ошибки
    if grep -q "<!DOCTYPE html>" "$filepath" 2>/dev/null; then
      invalid_files+=("$suit/$filename (содержит HTML)")
      continue
    fi
    
    total_found=$((total_found + 1))
  done
done

# Выводим результаты
echo "📊 Результаты проверки:"
echo "   Ожидалось файлов: $total_expected"
echo "   Найдено файлов: $total_found"
echo ""

if [ ${#missing_files[@]} -gt 0 ]; then
  echo "❌ Отсутствующие файлы (${#missing_files[@]}):"
  for file in "${missing_files[@]}"; do
    echo "   - $file"
  done
  echo ""
fi

if [ ${#invalid_files[@]} -gt 0 ]; then
  echo "❌ Невалидные файлы (${#invalid_files[@]}):"
  for file in "${invalid_files[@]}"; do
    echo "   - $file"
  done
  echo ""
fi

# Финальная проверка
if [ $total_found -eq $total_expected ]; then
  echo "✅ Все $total_expected SVG-файлов найдены и валидны!"
  echo ""
  echo "📁 Структура файлов:"
  for suit in "${SUITS[@]}"; do
    count=$(ls -1 "$BASE_DIR/$suit/"*.svg 2>/dev/null | wc -l | tr -d ' ')
    echo "   $suit: $count файлов"
  done
  exit 0
else
  echo "❌ Ошибка: Найдено только $total_found из $total_expected файлов"
  echo ""
  echo "💡 Решение:"
  echo "   Загрузите SVG-файлы из OpenDecks:"
  echo "   chmod +x download-opendecks.sh"
  echo "   ./download-opendecks.sh"
  echo ""
  echo "   Или скачайте вручную с:"
  echo "   https://github.com/hhonbo/OpenDecks-Public-Domain-and-CC0-Playing-Cards"
  exit 1
fi
