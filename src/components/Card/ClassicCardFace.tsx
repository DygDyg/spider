import React from 'react';
import { Card as CardType, RANK_NAMES, SUIT_SYMBOLS } from '../../game/types';

interface Props {
  card: CardType;
  isDarkTheme?: boolean;
  className?: string;
}

type Pip = { x: number; y: number; upsideDown?: boolean };

const pipLayouts: Record<number, Pip[]> = {
  2: [{x:50,y:34},{x:50,y:106,upsideDown:true}],
  3: [{x:50,y:32},{x:50,y:70},{x:50,y:108,upsideDown:true}],
  4: [{x:30,y:35},{x:70,y:35},{x:30,y:105,upsideDown:true},{x:70,y:105,upsideDown:true}],
  5: [{x:30,y:35},{x:70,y:35},{x:50,y:70},{x:30,y:105,upsideDown:true},{x:70,y:105,upsideDown:true}],
  6: [{x:30,y:32},{x:70,y:32},{x:30,y:70},{x:70,y:70},{x:30,y:108,upsideDown:true},{x:70,y:108,upsideDown:true}],
  7: [{x:30,y:30},{x:70,y:30},{x:50,y:49},{x:30,y:70},{x:70,y:70},{x:30,y:110,upsideDown:true},{x:70,y:110,upsideDown:true}],
  8: [{x:30,y:30},{x:70,y:30},{x:50,y:49},{x:30,y:70},{x:70,y:70},{x:50,y:91,upsideDown:true},{x:30,y:110,upsideDown:true},{x:70,y:110,upsideDown:true}],
  9: [{x:30,y:30},{x:70,y:30},{x:30,y:52},{x:70,y:52},{x:50,y:70},{x:30,y:88,upsideDown:true},{x:70,y:88,upsideDown:true},{x:30,y:110,upsideDown:true},{x:70,y:110,upsideDown:true}],
  10: [{x:30,y:29},{x:70,y:29},{x:50,y:44},{x:30,y:52},{x:70,y:52},{x:30,y:88,upsideDown:true},{x:70,y:88,upsideDown:true},{x:50,y:96,upsideDown:true},{x:30,y:111,upsideDown:true},{x:70,y:111,upsideDown:true}],
};

export const ClassicCardFace: React.FC<Props> = ({ card, isDarkTheme = false, className = '' }) => {
  const black = card.suit === 'spades' || card.suit === 'clubs';
  const color = black
    ? (isDarkTheme ? '#A8C7FA' : '#192232')
    : (isDarkTheme ? '#FF6B6B' : '#C72535');
  const symbol = SUIT_SYMBOLS[card.suit];
  const rank = RANK_NAMES[card.rank];
  const family = "'DejaVu Sans', 'Noto Sans Symbols 2', 'Segoe UI Symbol', 'Arial Unicode MS', sans-serif";
  const isCourt = card.rank >= 11;
  const isAce = card.rank === 1;

  return (
    <svg className={`card-svg ${className}`} viewBox="0 0 100 140"
      preserveAspectRatio="xMidYMid meet" role="img"
      aria-label={`${rank} ${symbol}`}>
      <rect x="0.5" y="0.5" width="99" height="139" rx="5" fill={isDarkTheme ? '#252B3C' : '#FFFEF7'} stroke={isDarkTheme ? '#59677E' : '#D8D2C6'} />
      <g fill={color} fontFamily={family} textAnchor="middle">
        <text x="11" y="15" fontSize="13" fontWeight="bold">{rank}</text>
        <text x="11" y="27" fontSize="11">{symbol}</text>
        <g transform="rotate(180 50 70)">
          <text x="11" y="15" fontSize="13" fontWeight="bold">{rank}</text>
          <text x="11" y="27" fontSize="11">{symbol}</text>
        </g>
        {isAce && <text x="50" y="84" fontSize="51">{symbol}</text>}
        {isCourt && (
          <>
            <rect x="23" y="30" width="54" height="80" rx="4" fill="none" stroke={color} strokeWidth="0.9" opacity="0.65" />
            <path d="M26 70 H74 M50 33 V107" stroke={color} strokeWidth="0.5" opacity="0.35" />
            <text x="50" y="68" fontSize="37" fontWeight="bold">{rank}</text>
            <text x="50" y="99" fontSize="26">{symbol}</text>
          </>
        )}
        {!isAce && !isCourt && pipLayouts[card.rank]?.map((pip, index) => (
          <text key={index} x={pip.x} y={pip.y} fontSize={card.rank >= 9 ? 17 : 20}
            transform={pip.upsideDown ? `rotate(180 ${pip.x} ${pip.y - 6})` : undefined}>
            {symbol}
          </text>
        ))}
      </g>
    </svg>
  );
};
