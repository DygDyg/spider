// Встроенные SVG-данные для всех 52 карт в стиле OpenDecks
// Многоцветные фигурные карты с классическими иллюстрациями

import { Suit, Rank } from '../../game/types';

// Символы мастей
const suitSymbols: Record<Suit, string> = {
  spades: 'M12,2 C12,2 4,10 4,14 C4,17 6.5,18 8.5,18 C8.5,18 7,20 7,22 L17,22 C17,20 15.5,18 15.5,18 C17.5,18 20,17 20,14 C20,10 12,2 12,2 Z',
  hearts: 'M12,21.35 L10.55,20.03 C5.4,15.36 2,12.28 2,8.5 C2,5.42 4.42,3 7.5,3 C9.24,3 10.91,3.81 12,5.09 C13.09,3.81 14.76,3 16.5,3 C19.58,3 22,5.42 22,8.5 C22,12.28 18.6,15.36 13.45,20.03 L12,21.35 Z',
  diamonds: 'M12,2 L22,12 L12,22 L2,12 Z',
  clubs: 'M12,2 C9.24,2 7,4.24 7,7 C7,8.5 7.7,9.8 8.8,10.7 C7.3,11.1 6,12.4 6,14 C6,16.2 7.8,18 10,18 C10.3,18 10.6,17.9 10.9,17.8 C10.3,18.5 10,19.4 10,20.5 L14,20.5 C14,19.4 13.7,18.5 13.1,17.8 C13.4,17.9 13.7,18 14,18 C16.2,18 18,16.2 18,14 C18,12.4 16.7,11.1 15.2,10.7 C16.3,9.8 17,8.5 17,7 C17,4.24 14.76,2 12,2 Z',
};

// Позиции символов мастей для числовых карт
const getPipPositions = (rank: Rank): Array<{ x: number; y: number; rotate: boolean }> => {
  const left = 28;
  const right = 72;
  const center = 50;
  const top1 = 30;
  const top2 = 48;
  const mid1 = 62;
  const mid2 = 78;
  const bot1 = 96;
  const bot2 = 114;

  switch (rank) {
    case 2:
      return [
        { x: center, y: top1, rotate: false },
        { x: center, y: bot2, rotate: true },
      ];
    case 3:
      return [
        { x: center, y: top1, rotate: false },
        { x: center, y: mid2, rotate: false },
        { x: center, y: bot2, rotate: true },
      ];
    case 4:
      return [
        { x: left, y: top1, rotate: false },
        { x: right, y: top1, rotate: false },
        { x: left, y: bot2, rotate: true },
        { x: right, y: bot2, rotate: true },
      ];
    case 5:
      return [
        { x: left, y: top1, rotate: false },
        { x: right, y: top1, rotate: false },
        { x: center, y: mid2, rotate: false },
        { x: left, y: bot2, rotate: true },
        { x: right, y: bot2, rotate: true },
      ];
    case 6:
      return [
        { x: left, y: top1, rotate: false },
        { x: right, y: top1, rotate: false },
        { x: left, y: mid1, rotate: false },
        { x: right, y: mid1, rotate: false },
        { x: left, y: bot2, rotate: true },
        { x: right, y: bot2, rotate: true },
      ];
    case 7:
      return [
        { x: left, y: top1, rotate: false },
        { x: right, y: top1, rotate: false },
        { x: center, y: top2, rotate: false },
        { x: left, y: mid1, rotate: false },
        { x: right, y: mid1, rotate: false },
        { x: left, y: bot2, rotate: true },
        { x: right, y: bot2, rotate: true },
      ];
    case 8:
      return [
        { x: left, y: top1, rotate: false },
        { x: right, y: top1, rotate: false },
        { x: center, y: top2, rotate: false },
        { x: left, y: mid1, rotate: false },
        { x: right, y: mid1, rotate: false },
        { x: left, y: bot2, rotate: true },
        { x: right, y: bot2, rotate: true },
        { x: center, y: bot1, rotate: true },
      ];
    case 9:
      return [
        { x: left, y: top1, rotate: false },
        { x: right, y: top1, rotate: false },
        { x: center, y: top2, rotate: false },
        { x: left, y: mid1, rotate: false },
        { x: right, y: mid1, rotate: false },
        { x: center, y: mid2, rotate: false },
        { x: left, y: bot2, rotate: true },
        { x: right, y: bot2, rotate: true },
        { x: center, y: bot1, rotate: true },
      ];
    case 10:
      return [
        { x: left, y: top1, rotate: false },
        { x: right, y: top1, rotate: false },
        { x: center, y: top2, rotate: false },
        { x: left, y: mid1, rotate: false },
        { x: right, y: mid1, rotate: false },
        { x: left, y: mid2, rotate: false },
        { x: right, y: mid2, rotate: false },
        { x: left, y: bot2, rotate: true },
        { x: right, y: bot2, rotate: true },
        { x: center, y: bot1, rotate: true },
      ];
    default:
      return [];
  }
};

// Размер символа масти
const getPipSize = (rank: Rank): number => {
  if (rank <= 4) return 20;
  if (rank <= 7) return 17;
  return 15;
};

// Многоцветная иллюстрация для Валета
const getJackSVG = (suit: Suit): string => {
  const suitPath = suitSymbols[suit];
  return `
    <g>
      <!-- Шляпа -->
      <path d="M30,30 L38,20 L50,26 L62,20 L70,30 Z" fill="#8B4513" opacity="0.9"/>
      <ellipse cx="50" cy="30" rx="22" ry="3" fill="#654321"/>
      <circle cx="50" cy="20" r="2" fill="#FFD700"/>
      
      <!-- Перо на шляпе -->
      <path d="M50,20 Q55,15 60,18" fill="none" stroke="#DC143C" stroke-width="1.5"/>
      
      <!-- Голова -->
      <ellipse cx="50" cy="40" rx="10" ry="11" fill="#FFE4C4"/>
      <ellipse cx="50" cy="40" rx="8" ry="9" fill="#FFDAB9"/>
      
      <!-- Волосы -->
      <path d="M40,35 Q38,40 40,45" fill="#8B4513" opacity="0.6"/>
      <path d="M60,35 Q62,40 60,45" fill="#8B4513" opacity="0.6"/>
      
      <!-- Глаза -->
      <circle cx="46" cy="38" r="1.2" fill="#2c1810"/>
      <circle cx="54" cy="38" r="1.2" fill="#2c1810"/>
      <circle cx="46.3" cy="37.7" r="0.4" fill="white"/>
      <circle cx="54.3" cy="37.7" r="0.4" fill="white"/>
      
      <!-- Нос -->
      <path d="M50,40 L49,43 L51,43" fill="none" stroke="#d4a574" stroke-width="0.8"/>
      
      <!-- Рот -->
      <path d="M47,45 Q50,46 53,45" fill="none" stroke="#c9756b" stroke-width="0.8"/>
      
      <!-- Шея -->
      <rect x="47" y="50" width="6" height="5" fill="#FFE4C4"/>
      
      <!-- Воротник -->
      <path d="M40,55 L50,60 L60,55" fill="white" stroke="#ddd" stroke-width="0.5"/>
      
      <!-- Тело/туника -->
      <path d="M35,55 L38,70 L62,70 L65,55 Z" fill="#4169E1"/>
      <path d="M35,55 L38,70 L62,70 L65,55 Z" fill="url(#jackBodyGrad)" opacity="0.3"/>
      
      <!-- Пояс -->
      <rect x="35" y="62" width="30" height="3" fill="#8B4513"/>
      <circle cx="50" cy="63.5" r="1.5" fill="#FFD700"/>
      
      <!-- Символ масти на груди -->
      <g transform="translate(50, 58) scale(0.4)">
        <path d="${suitPath}" fill="${suit === 'hearts' || suit === 'diamonds' ? '#DC143C' : '#1a1a2e'}"/>
      </g>
      
      <!-- Руки -->
      <path d="M35,55 L28,62 L30,68" fill="#4169E1" stroke="#2c4d9e" stroke-width="0.5"/>
      <path d="M65,55 L72,62 L70,68" fill="#4169E1" stroke="#2c4d9e" stroke-width="0.5"/>
      
      <!-- Кисти рук -->
      <ellipse cx="30" cy="68" rx="2.5" ry="3" fill="#FFE4C4"/>
      <ellipse cx="70" cy="68" rx="2.5" ry="3" fill="#FFE4C4"/>
      
      <!-- Меч в руке -->
      <rect x="28" y="55" width="1.5" height="15" fill="#C0C0C0"/>
      <rect x="26" y="54" width="5" height="2" fill="#8B4513"/>
      <circle cx="28.75" cy="54" r="1" fill="#FFD700"/>
    </g>
  `;
};

// Многоцветная иллюстрация для Дамы
const getQueenSVG = (suit: Suit): string => {
  const suitPath = suitSymbols[suit];
  return `
    <g>
      <!-- Волосы (задний план) -->
      <ellipse cx="50" cy="38" rx="14" ry="16" fill="#8B4513" opacity="0.4"/>
      
      <!-- Корона -->
      <path d="M35,28 L38,18 L43,24 L50,14 L57,24 L62,18 L65,28 Z" fill="#FFD700"/>
      <ellipse cx="50" cy="28" rx="16" ry="2.5" fill="#DAA520"/>
      
      <!-- Драгоценности на короне -->
      <circle cx="50" cy="14" r="2.5" fill="#DC143C"/>
      <circle cx="38" cy="18" r="1.5" fill="#4169E1"/>
      <circle cx="62" cy="18" r="1.5" fill="#4169E1"/>
      <circle cx="43" cy="24" r="1" fill="#32CD32"/>
      <circle cx="57" cy="24" r="1" fill="#32CD32"/>
      
      <!-- Голова -->
      <ellipse cx="50" cy="40" rx="10" ry="11" fill="#FFE4C4"/>
      <ellipse cx="50" cy="40" rx="8" ry="9" fill="#FFDAB9"/>
      
      <!-- Волосы (передний план) -->
      <path d="M40,32 Q38,38 40,45" fill="#8B4513" opacity="0.7"/>
      <path d="M60,32 Q62,38 60,45" fill="#8B4513" opacity="0.7"/>
      <path d="M42,30 Q50,28 58,30" fill="#8B4513" opacity="0.5"/>
      
      <!-- Глаза -->
      <ellipse cx="46" cy="38" rx="1.5" ry="1.8" fill="#2c1810"/>
      <ellipse cx="54" cy="38" rx="1.5" ry="1.8" fill="#2c1810"/>
      <circle cx="46.3" cy="37.5" r="0.5" fill="white"/>
      <circle cx="54.3" cy="37.5" r="0.5" fill="white"/>
      
      <!-- Ресницы -->
      <path d="M44,37 L43,36" stroke="#2c1810" stroke-width="0.5"/>
      <path d="M56,37 L57,36" stroke="#2c1810" stroke-width="0.5"/>
      
      <!-- Нос -->
      <path d="M50,40 L49,43 L51,43" fill="none" stroke="#d4a574" stroke-width="0.8"/>
      
      <!-- Рот -->
      <path d="M47,45 Q50,47 53,45" fill="#DC143C" opacity="0.6"/>
      
      <!-- Серёжки -->
      <circle cx="38" cy="42" r="1.5" fill="#FFD700"/>
      <circle cx="62" cy="42" r="1.5" fill="#FFD700"/>
      
      <!-- Шея -->
      <rect x="47" y="50" width="6" height="4" fill="#FFE4C4"/>
      
      <!-- Ожерелье -->
      <ellipse cx="50" cy="52" rx="8" ry="2" fill="none" stroke="#FFD700" stroke-width="1"/>
      <circle cx="50" cy="54" r="1.5" fill="#DC143C"/>
      
      <!-- Платье -->
      <path d="M32,54 L35,70 L65,70 L68,54 Z" fill="#DC143C"/>
      <path d="M32,54 L35,70 L65,70 L68,54 Z" fill="url(#queenDressGrad)" opacity="0.3"/>
      
      <!-- Декор на платье -->
      <path d="M40,58 L50,62 L60,58" fill="none" stroke="#FFD700" stroke-width="1"/>
      <circle cx="50" cy="62" r="1.5" fill="#FFD700"/>
      
      <!-- Символ масти -->
      <g transform="translate(50, 65) scale(0.35)">
        <path d="${suitPath}" fill="${suit === 'hearts' || suit === 'diamonds' ? '#FFD700' : '#FFFFFF'}"/>
      </g>
      
      <!-- Руки -->
      <path d="M32,54 L26,62 L28,68" fill="#DC143C" stroke="#a01020" stroke-width="0.5"/>
      <path d="M68,54 L74,62 L72,68" fill="#DC143C" stroke="#a01020" stroke-width="0.5"/>
      
      <!-- Кисти рук -->
      <ellipse cx="28" cy="68" rx="2.5" ry="3" fill="#FFE4C4"/>
      <ellipse cx="72" cy="68" rx="2.5" ry="3" fill="#FFE4C4"/>
      
      <!-- Цветок в руке -->
      <circle cx="26" cy="65" r="3" fill="#FF69B4"/>
      <circle cx="26" cy="65" r="1.5" fill="#FFD700"/>
    </g>
  `;
};

// Многоцветная иллюстрация для Короля
const getKingSVG = (suit: Suit): string => {
  const suitPath = suitSymbols[suit];
  return `
    <g>
      <!-- Мантия (задний план) -->
      <path d="M25,50 L30,70 L70,70 L75,50 Z" fill="#8B0000" opacity="0.5"/>
      
      <!-- Большая корона -->
      <path d="M28,26 L34,14 L42,22 L50,10 L58,22 L66,14 L72,26 Z" fill="#FFD700"/>
      <ellipse cx="50" cy="26" rx="24" ry="3" fill="#DAA520"/>
      
      <!-- Драгоценности на короне -->
      <circle cx="50" cy="10" r="3" fill="#DC143C"/>
      <circle cx="34" cy="14" r="2" fill="#4169E1"/>
      <circle cx="66" cy="14" r="2" fill="#4169E1"/>
      <circle cx="42" cy="22" r="1.5" fill="#32CD32"/>
      <circle cx="58" cy="22" r="1.5" fill="#32CD32"/>
      
      <!-- Крест на короне -->
      <rect x="49" y="7" width="2" height="6" fill="#FFD700"/>
      <rect x="47" y="9" width="6" height="2" fill="#FFD700"/>
      
      <!-- Голова -->
      <ellipse cx="50" cy="38" rx="11" ry="12" fill="#FFE4C4"/>
      <ellipse cx="50" cy="38" rx="9" ry="10" fill="#FFDAB9"/>
      
      <!-- Волосы/борода -->
      <path d="M39,35 Q37,42 40,48" fill="#C0C0C0" opacity="0.6"/>
      <path d="M61,35 Q63,42 60,48" fill="#C0C0C0" opacity="0.6"/>
      <path d="M42,45 Q50,52 58,45" fill="#C0C0C0" opacity="0.5"/>
      
      <!-- Глаза -->
      <ellipse cx="46" cy="36" rx="1.5" ry="2" fill="#2c1810"/>
      <ellipse cx="54" cy="36" rx="1.5" ry="2" fill="#2c1810"/>
      <circle cx="46.3" cy="35.5" r="0.5" fill="white"/>
      <circle cx="54.3" cy="35.5" r="0.5" fill="white"/>
      
      <!-- Брови -->
      <path d="M43,33 Q46,32 49,33" fill="none" stroke="#2c1810" stroke-width="1"/>
      <path d="M51,33 Q54,32 57,33" fill="none" stroke="#2c1810" stroke-width="1"/>
      
      <!-- Нос -->
      <path d="M50,38 L49,42 L51,42" fill="none" stroke="#d4a574" stroke-width="1"/>
      
      <!-- Рот/борода -->
      <path d="M45,45 Q50,48 55,45" fill="#C0C0C0" opacity="0.7"/>
      
      <!-- Шея -->
      <rect x="46" y="48" width="8" height="5" fill="#FFE4C4"/>
      
      <!-- Воротник/мех -->
      <ellipse cx="50" cy="52" rx="16" ry="4" fill="#F5F5DC"/>
      <path d="M34,52 Q50,58 66,52" fill="none" stroke="#D3D3D3" stroke-width="2"/>
      
      <!-- Мантия/туника -->
      <path d="M30,52 L33,70 L67,70 L70,52 Z" fill="#4B0082"/>
      <path d="M30,52 L33,70 L67,70 L70,52 Z" fill="url(#kingRobeGrad)" opacity="0.3"/>
      
      <!-- Горностаевая отделка -->
      <rect x="30" y="52" width="40" height="3" fill="#F5F5DC"/>
      <circle cx="35" cy="53.5" r="0.8" fill="#000000"/>
      <circle cx="45" cy="53.5" r="0.8" fill="#000000"/>
      <circle cx="55" cy="53.5" r="0.8" fill="#000000"/>
      <circle cx="65" cy="53.5" r="0.8" fill="#000000"/>
      
      <!-- Пояс -->
      <rect x="30" y="62" width="40" height="3" fill="#FFD700"/>
      <circle cx="50" cy="63.5" r="2" fill="#DC143C"/>
      
      <!-- Символ масти -->
      <g transform="translate(50, 58) scale(0.45)">
        <path d="${suitPath}" fill="${suit === 'hearts' || suit === 'diamonds' ? '#FFD700' : '#FFFFFF'}"/>
      </g>
      
      <!-- Скипетр слева -->
      <rect x="20" y="50" width="2.5" height="20" fill="#FFD700"/>
      <circle cx="21.25" cy="50" r="4" fill="#4169E1"/>
      <circle cx="21.25" cy="50" r="2" fill="#FFD700"/>
      
      <!-- Держава справа -->
      <rect x="77" y="52" width="2.5" height="18" fill="#FFD700"/>
      <circle cx="78.25" cy="52" r="5" fill="#DC143C"/>
      <rect x="76" y="47" width="4.5" height="5" fill="#FFD700"/>
      <path d="M78.25,47 L78.25,42" stroke="#FFD700" stroke-width="1.5"/>
      <circle cx="78.25" cy="42" r="2" fill="#FFD700"/>
      
      <!-- Руки -->
      <path d="M30,52 L22,60 L24,68" fill="#4B0082" stroke="#3a0066" stroke-width="0.5"/>
      <path d="M70,52 L78,60 L76,68" fill="#4B0082" stroke="#3a0066" stroke-width="0.5"/>
      
      <!-- Кисти рук -->
      <ellipse cx="24" cy="68" rx="3" ry="3.5" fill="#FFE4C4"/>
      <ellipse cx="76" cy="68" rx="3" ry="3.5" fill="#FFE4C4"/>
    </g>
  `;
};

// Генерация SVG для числовой карты
export const getNumberCardSVG = (suit: Suit, rank: Rank, color: string): string => {
  const suitPath = suitSymbols[suit];
  const positions = getPipPositions(rank);
  const pipSize = getPipSize(rank);
  
  let pipsSVG = '';
  positions.forEach((pos) => {
    const scale = pipSize / 24;
    const transform = pos.rotate
      ? `translate(${pos.x}, ${pos.y}) scale(${scale}) rotate(180) translate(-12, -12)`
      : `translate(${pos.x}, ${pos.y}) scale(${scale}) translate(-12, -12)`;
    pipsSVG += `<g transform="${transform}"><path d="${suitPath}" fill="${color}"/></g>`;
  });
  
  return pipsSVG;
};

// Генерация SVG для туза
export const getAceCardSVG = (suit: Suit, color: string): string => {
  const suitPath = suitSymbols[suit];
  return `
    <g transform="translate(50, 70) scale(2.5) translate(-12, -12)">
      <path d="${suitPath}" fill="${color}"/>
    </g>
  `;
};

// Генерация SVG для фигурной карты
export const getFaceCardSVG = (suit: Suit, rank: Rank): string => {
  switch (rank) {
    case 11:
      return getJackSVG(suit);
    case 12:
      return getQueenSVG(suit);
    case 13:
      return getKingSVG(suit);
    default:
      return '';
  }
};

// Градиенты для фигурных карт
export const getFaceCardGradients = (): string => {
  return `
    <defs>
      <linearGradient id="jackBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="rgba(255,255,255,0.3)"/>
        <stop offset="100%" stop-color="rgba(0,0,0,0.2)"/>
      </linearGradient>
      <linearGradient id="queenDressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="rgba(255,255,255,0.3)"/>
        <stop offset="100%" stop-color="rgba(0,0,0,0.2)"/>
      </linearGradient>
      <linearGradient id="kingRobeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="rgba(255,255,255,0.3)"/>
        <stop offset="100%" stop-color="rgba(0,0,0,0.2)"/>
      </linearGradient>
    </defs>
  `;
};
