import React from 'react';
import { Suit, Rank } from '../../game/types';

interface CardFaceProps {
  suit: Suit;
  rank: Rank;
  color: string;
}

// viewBox для всей карты: 100 x 140 (соотношение 5:7)
const VW = 100;
const VH = 140;

// Единый SVG символ масти в координатах viewBox 0 0 24 24
const SuitPath: React.FC<{ suit: Suit }> = ({ suit }) => {
  switch (suit) {
    case 'spades':
      return (
        <path d="M12,2 C12,2 4,10 4,14 C4,17 6.5,18 8.5,18 C8.5,18 7,20 7,22 L17,22 C17,20 15.5,18 15.5,18 C17.5,18 20,17 20,14 C20,10 12,2 12,2 Z" />
      );
    case 'hearts':
      return (
        <path d="M12,21.35 L10.55,20.03 C5.4,15.36 2,12.28 2,8.5 C2,5.42 4.42,3 7.5,3 C9.24,3 10.91,3.81 12,5.09 C13.09,3.81 14.76,3 16.5,3 C19.58,3 22,5.42 22,8.5 C22,12.28 18.6,15.36 13.45,20.03 L12,21.35 Z" />
      );
    case 'diamonds':
      return <path d="M12,2 L22,12 L12,22 L2,12 Z" />;
    case 'clubs':
      return (
        <g>
          <circle cx="12" cy="7.5" r="4.5" />
          <circle cx="7" cy="14" r="4.5" />
          <circle cx="17" cy="14" r="4.5" />
          <path d="M10.5,17 L10.5,22 L13.5,22 L13.5,17 Z" />
        </g>
      );
  }
};

// Компонент символа масти с возможностью масштабирования и поворота
const SuitMark: React.FC<{
  suit: Suit;
  color: string;
  cx: number;
  cy: number;
  size: number;
  rotate?: boolean;
}> = ({ suit, color, cx, cy, size, rotate = false }) => {
  // suit path нарисован в viewBox 0 0 24 24, центрирован в (12,12)
  // Мы масштабируем его до size и размещаем в (cx, cy)
  const scale = size / 24;
  const transform = rotate
    ? `translate(${cx}, ${cy}) scale(${scale}) rotate(180) translate(-12, -12)`
    : `translate(${cx}, ${cy}) scale(${scale}) translate(-12, -12)`;
  return (
    <g transform={transform} fill={color}>
      <SuitPath suit={suit} />
    </g>
  );
};

// Позиции символов мастей для числовых карт
// Координаты в viewBox 100x140
// Область для символов: x от 15 до 85, y от 25 до 115
const getNumberPositions = (rank: Rank): Array<{ x: number; y: number; rotate: boolean }> => {
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

// Размер символа масти для числовых карт
const getPipSize = (rank: Rank): number => {
  if (rank <= 4) return 20;
  if (rank <= 7) return 17;
  return 15;
};

// Фигурные карты — единый SVG с классическим дизайном
const FaceCardSVG: React.FC<{ suit: Suit; rank: Rank; color: string }> = ({ suit, rank, color }) => {
  // Все координаты в viewBox 100x140
  const halfH = VH / 2; // 70
  const centerX = VW / 2; // 50

  // Верхняя половина (нормальная)
  const renderHalf = (flipY: boolean) => {
    const yScale = flipY ? -1 : 1;
    const yTranslate = flipY ? VH : 0;
    const groupTransform = `translate(0, ${yTranslate}) scale(1, ${yScale})`;

    if (rank === 11) {
      // Валет
      return (
        <g transform={groupTransform}>
          {/* Фон верхней половины */}
          <rect x="5" y="20" width="90" height="50" fill={color} opacity="0.06" rx="2" />

          {/* Шляпа */}
          <path d="M30,30 L38,20 L50,26 L62,20 L70,30 Z" fill={color} opacity="0.55" />
          <ellipse cx="50" cy="30" rx="22" ry="3" fill={color} opacity="0.65" />
          <circle cx="50" cy="20" r="2" fill={color} opacity="0.8" />

          {/* Голова */}
          <ellipse cx="50" cy="40" rx="10" ry="11" fill={color} opacity="0.22" />
          <ellipse cx="50" cy="40" rx="8" ry="9" fill={color} opacity="0.32" />

          {/* Глаза */}
          <circle cx="46" cy="38" r="1" fill={color} opacity="0.7" />
          <circle cx="54" cy="38" r="1" fill={color} opacity="0.7" />

          {/* Шея */}
          <rect x="47" y="50" width="6" height="5" fill={color} opacity="0.2" />

          {/* Тело */}
          <path d="M32,55 L36,70 L64,70 L68,55 Z" fill={color} opacity="0.28" />

          {/* Воротник */}
          <path d="M32,55 L50,62 L68,55" fill="none" stroke={color} strokeWidth="1.5" opacity="0.6" />

          {/* Символ масти на груди */}
          <SuitMark suit={suit} color={color} cx={50} cy={63} size={10} />

          {/* Руки */}
          <path d="M32,55 L24,65 L28,70" fill="none" stroke={color} strokeWidth="2.5" opacity="0.22" strokeLinecap="round" />
          <path d="M68,55 L76,65 L72,70" fill="none" stroke={color} strokeWidth="2.5" opacity="0.22" strokeLinecap="round" />
        </g>
      );
    }

    if (rank === 12) {
      // Дама
      return (
        <g transform={groupTransform}>
          <rect x="5" y="20" width="90" height="50" fill={color} opacity="0.06" rx="2" />

          {/* Волосы */}
          <path d="M34,32 Q30,42 34,52" fill="none" stroke={color} strokeWidth="2" opacity="0.3" />
          <path d="M66,32 Q70,42 66,52" fill="none" stroke={color} strokeWidth="2" opacity="0.3" />

          {/* Корона */}
          <path d="M32,28 L37,18 L43,24 L50,14 L57,24 L63,18 L68,28 Z" fill={color} opacity="0.6" />
          <ellipse cx="50" cy="28" rx="19" ry="2.5" fill={color} opacity="0.5" />
          <circle cx="50" cy="14" r="2" fill={color} opacity="0.85" />
          <circle cx="37" cy="18" r="1.2" fill={color} opacity="0.7" />
          <circle cx="63" cy="18" r="1.2" fill={color} opacity="0.7" />

          {/* Голова */}
          <ellipse cx="50" cy="40" rx="10" ry="11" fill={color} opacity="0.22" />
          <ellipse cx="50" cy="40" rx="8" ry="9" fill={color} opacity="0.32" />

          {/* Глаза */}
          <circle cx="46" cy="38" r="1" fill={color} opacity="0.7" />
          <circle cx="54" cy="38" r="1" fill={color} opacity="0.7" />

          {/* Шея */}
          <rect x="47" y="50" width="6" height="4" fill={color} opacity="0.2" />

          {/* Платье */}
          <path d="M30,54 L34,70 L66,70 L70,54 Z" fill={color} opacity="0.28" />

          {/* Ожерелье */}
          <ellipse cx="50" cy="54" rx="14" ry="3" fill={color} opacity="0.35" />

          {/* Символ масти */}
          <SuitMark suit={suit} color={color} cx={50} cy={63} size={10} />

          {/* Руки */}
          <path d="M30,54 L22,64 L26,70" fill="none" stroke={color} strokeWidth="2.5" opacity="0.22" strokeLinecap="round" />
          <path d="M70,54 L78,64 L74,70" fill="none" stroke={color} strokeWidth="2.5" opacity="0.22" strokeLinecap="round" />

          {/* Цветок в руке */}
          <circle cx="22" cy="64" r="3" fill={color} opacity="0.4" />
        </g>
      );
    }

    // Король
    return (
      <g transform={groupTransform}>
        <rect x="5" y="20" width="90" height="50" fill={color} opacity="0.06" rx="2" />

        {/* Большая корона */}
        <path d="M28,26 L34,14 L42,22 L50,10 L58,22 L66,14 L72,26 Z" fill={color} opacity="0.7" />
        <ellipse cx="50" cy="26" rx="24" ry="3" fill={color} opacity="0.6" />
        <circle cx="50" cy="10" r="2.5" fill={color} opacity="0.9" />
        <circle cx="34" cy="14" r="1.5" fill={color} opacity="0.8" />
        <circle cx="66" cy="14" r="1.5" fill={color} opacity="0.8" />

        {/* Голова */}
        <ellipse cx="50" cy="38" rx="11" ry="12" fill={color} opacity="0.22" />
        <ellipse cx="50" cy="38" rx="9" ry="10" fill={color} opacity="0.32" />

        {/* Борода */}
        <path d="M40,44 Q50,52 60,44" fill={color} opacity="0.2" />

        {/* Глаза */}
        <circle cx="46" cy="36" r="1" fill={color} opacity="0.7" />
        <circle cx="54" cy="36" r="1" fill={color} opacity="0.7" />

        {/* Шея */}
        <rect x="46" y="48" width="8" height="5" fill={color} opacity="0.2" />

        {/* Мантия */}
        <path d="M28,53 L32,70 L68,70 L72,53 Z" fill={color} opacity="0.32" />

        {/* Воротник */}
        <ellipse cx="50" cy="53" rx="16" ry="3.5" fill={color} opacity="0.35" />
        <path d="M28,53 Q50,60 72,53" fill="none" stroke={color} strokeWidth="2" opacity="0.55" />

        {/* Символ масти */}
        <SuitMark suit={suit} color={color} cx={50} cy={62} size={11} />

        {/* Скипетр слева */}
        <rect x="17" y="53" width="2.5" height="17" fill={color} opacity="0.5" />
        <circle cx="18.25" cy="53" r="3.5" fill={color} opacity="0.6" />

        {/* Держава справа */}
        <rect x="80.5" y="55" width="2.5" height="15" fill={color} opacity="0.5" />
        <circle cx="81.75" cy="55" r="4" fill={color} opacity="0.6" />
        <rect x="79.5" y="48" width="4.5" height="4.5" fill={color} opacity="0.7" />
        <path d="M81.75,48 L81.75,43" stroke={color} strokeWidth="1.5" opacity="0.8" />
        <circle cx="81.75" cy="42" r="1.5" fill={color} opacity="0.9" />

        {/* Руки */}
        <path d="M28,53 L20,62 L22,70" fill="none" stroke={color} strokeWidth="3" opacity="0.22" strokeLinecap="round" />
        <path d="M72,53 L80,62 L78,70" fill="none" stroke={color} strokeWidth="3" opacity="0.22" strokeLinecap="round" />
      </g>
    );
  };

  return (
    <g>
      {/* Разделительная линия */}
      <line x1="5" y1={halfH} x2="95" y2={halfH} stroke={color} strokeWidth="0.5" opacity="0.3" />

      {/* Верхняя половина (нормальная) */}
      {renderHalf(false)}

      {/* Нижняя половина (перевёрнутая) */}
      {renderHalf(true)}
    </g>
  );
};

// Туз — большой символ масти в центре
const AceSVG: React.FC<{ suit: Suit; color: string }> = ({ suit, color }) => {
  return (
    <g>
      <SuitMark suit={suit} color={color} cx={50} cy={70} size={60} />
    </g>
  );
};

// Основная функция рендера содержимого карты
export const CardFace: React.FC<CardFaceProps> = ({ suit, rank, color }) => {
  const rankStr = rank === 1 ? 'A' : rank === 11 ? 'J' : rank === 12 ? 'Q' : rank === 13 ? 'K' : String(rank);

  // Угловой индекс — маленький символ масти в углу
  const cornerSuitSize = 10;
  const cornerRankSize = 12;

  return (
    <>
      {/* Верхний левый угол */}
      <text
        x="8"
        y="14"
        fontSize={cornerRankSize}
        fontWeight="bold"
        fontFamily="Georgia, serif"
        fill={color}
      >
        {rankStr}
      </text>
      <SuitMark suit={suit} color={color} cx={12} cy={22} size={cornerSuitSize} />

      {/* Нижний правый угол (перевёрнутый) */}
      <g transform={`translate(${VW}, ${VH}) rotate(180)`}>
        <text
          x="8"
          y="14"
          fontSize={cornerRankSize}
          fontWeight="bold"
          fontFamily="Georgia, serif"
          fill={color}
        >
          {rankStr}
        </text>
        <SuitMark suit={suit} color={color} cx={12} cy={22} size={cornerSuitSize} />
      </g>

      {/* Центральное содержимое */}
      {rank === 1 && <AceSVG suit={suit} color={color} />}
      {rank >= 2 && rank <= 10 &&
        getNumberPositions(rank).map((pos, i) => (
          <SuitMark
            key={i}
            suit={suit}
            color={color}
            cx={pos.x}
            cy={pos.y}
            size={getPipSize(rank)}
            rotate={pos.rotate}
          />
        ))
      }
      {rank >= 11 && rank <= 13 && <FaceCardSVG suit={suit} rank={rank} color={color} />}
    </>
  );
};
