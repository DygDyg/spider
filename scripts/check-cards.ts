import * as fs from 'fs';
import * as path from 'path';

interface CheckResult {
  totalExpected: number;
  totalFound: number;
  missing: string[];
  invalid: string[];
}

const SUITS = ['spades', 'hearts', 'diamonds', 'clubs'] as const;
const RANKS = ['ace', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'jack', 'queen', 'king'];

function checkCards(): CheckResult {
  const baseDir = path.join(process.cwd(), 'public/cards');
  const result: CheckResult = {
    totalExpected: 52,
    totalFound: 0,
    missing: [],
    invalid: [],
  };

  // Проверяем существование базовой директории
  if (!fs.existsSync(baseDir)) {
    console.error('❌ Ошибка: Директория public/cards не найдена');
    console.error('');
    console.error('Необходимо загрузить SVG-файлы карт из OpenDecks:');
    console.error('  chmod +x download-opendecks.sh');
    console.error('  ./download-opendecks.sh');
    process.exit(1);
  }

  // Проверяем каждый файл
  for (const suit of SUITS) {
    const suitDir = path.join(baseDir, suit);
    
    if (!fs.existsSync(suitDir)) {
      console.error(`❌ Директория не найдена: public/cards/${suit}`);
      for (const rank of RANKS) {
        result.missing.push(`${suit}/${rank} of ${suit}.svg`);
      }
      continue;
    }

    for (const rank of RANKS) {
      const filename = `${rank} of ${suit}.svg`;
      const filepath = path.join(suitDir, filename);

      if (!fs.existsSync(filepath)) {
        result.missing.push(`${suit}/${filename}`);
        continue;
      }

      // Проверяем размер файла
      const stats = fs.statSync(filepath);
      if (stats.size < 100) {
        result.invalid.push(`${suit}/${filename} (слишком маленький: ${stats.size} байт)`);
        continue;
      }

      // Проверяем наличие SVG тега
      const content = fs.readFileSync(filepath, 'utf-8');
      if (!content.includes('<svg')) {
        result.invalid.push(`${suit}/${filename} (не содержит <svg>)`);
        continue;
      }

      // Проверяем, что это не HTML страница ошибки
      if (content.includes('<!DOCTYPE html>')) {
        result.invalid.push(`${suit}/${filename} (содержит HTML)`);
        continue;
      }

      result.totalFound++;
    }
  }

  return result;
}

function printResults(result: CheckResult): void {
  console.log('🔍 Проверка наличия SVG-файлов карт...');
  console.log('');
  console.log('📊 Результаты проверки:');
  console.log(`   Ожидалось файлов: ${result.totalExpected}`);
  console.log(`   Найдено файлов: ${result.totalFound}`);
  console.log('');

  if (result.missing.length > 0) {
    console.log(`❌ Отсутствующие файлы (${result.missing.length}):`);
    result.missing.forEach(file => console.log(`   - ${file}`));
    console.log('');
  }

  if (result.invalid.length > 0) {
    console.log(`❌ Невалидные файлы (${result.invalid.length}):`);
    result.invalid.forEach(file => console.log(`   - ${file}`));
    console.log('');
  }

  if (result.totalFound === result.totalExpected) {
    console.log(`✅ Все ${result.totalExpected} SVG-файлов найдены и валидны!`);
    console.log('');
    console.log('📁 Структура файлов:');
    
    const baseDir = path.join(process.cwd(), 'public/cards');
    for (const suit of SUITS) {
      const suitDir = path.join(baseDir, suit);
      if (fs.existsSync(suitDir)) {
        const files = fs.readdirSync(suitDir).filter(f => f.endsWith('.svg'));
        console.log(`   ${suit}: ${files.length} файлов`);
      }
    }
    
    process.exit(0);
  } else {
    console.log(`❌ Ошибка: Найдено только ${result.totalFound} из ${result.totalExpected} файлов`);
    console.log('');
    console.log('💡 Решение:');
    console.log('   Загрузите SVG-файлы из OpenDecks:');
    console.log('   chmod +x download-opendecks.sh');
    console.log('   ./download-opendecks.sh');
    console.log('');
    console.log('   Или скачайте вручную с:');
    console.log('   https://github.com/hhonbo/OpenDecks-Public-Domain-and-CC0-Playing-Cards');
    process.exit(1);
  }
}

// Запуск проверки
const result = checkCards();
printResults(result);
