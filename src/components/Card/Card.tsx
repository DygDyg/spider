import React from 'react';
import { Card as CardType } from '../../game/types';
import { OpenDecksCard } from './OpenDecksCard';

interface CardProps {
  card: CardType;
  isHighlighted?: boolean;
  isHint?: boolean;
  isDarkTheme?: boolean;
  onClick?: () => void;
  onDoubleClick?: () => void;
  onPointerDown?: (e: React.PointerEvent) => void;
  style?: React.CSSProperties;
  className?: string;
}

// viewBox всей карты: 100 x 140 (соотношение 5:7)
const VW = 100;
const VH = 140;

export const CardComponent: React.FC<CardProps> = ({
  card,
  isHighlighted = false,
  isHint = false,
  isDarkTheme = false,
  onClick,
  onDoubleClick,
  onPointerDown,
  style,
  className = '',
}) => {
  if (!card.faceUp) {
    return (
      <div
        className={`card card-back ${className} ${isHighlighted ? 'card-highlighted' : ''}`}
        style={style}
        onClick={onClick}
        onPointerDown={onPointerDown}
      >
        <svg
          viewBox={`0 0 ${VW} ${VH}`}
          preserveAspectRatio="xMidYMid meet"
          className="card-svg"
        >
          {/* Фон рубашки */}
          <rect x="0" y="0" width={VW} height={VH} rx="6" fill="#1a3a7a" />
          <rect x="0" y="0" width={VW} height={VH} rx="6" fill="url(#backGradient)" />

          {/* Внутренняя рамка */}
          <rect x="5" y="5" width={VW - 10} height={VH - 10} rx="4" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />

          {/* Диагональный узор */}
          <defs>
            <linearGradient id="backGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2855a0" />
              <stop offset="50%" stopColor="#1a3a7a" />
              <stop offset="100%" stopColor="#2855a0" />
            </linearGradient>
            <pattern id="backPattern" x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <rect x="0" y="0" width="14" height="14" fill="none" />
              <path d="M0,7 L7,0 L14,7 L7,14 Z" fill="rgba(255,255,255,0.08)" />
            </pattern>
          </defs>
          <rect x="8" y="8" width={VW - 16} height={VH - 16} rx="3" fill="url(#backPattern)" />

          {/* Центральный ромб */}
          <g transform={`translate(${VW / 2}, ${VH / 2})`}>
            <rect x="-12" y="-12" width="24" height="24" rx="2" transform="rotate(45)" fill="rgba(255,255,255,0.25)" />
            <rect x="-8" y="-8" width="16" height="16" rx="1" transform="rotate(45)" fill="rgba(255,255,255,0.15)" />
          </g>
        </svg>
      </div>
    );
  }

  return (
    <div
      className={`card card-face ${className} ${isHighlighted ? 'card-highlighted' : ''} ${isHint ? 'card-hint' : ''}`}
      style={style}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onPointerDown={onPointerDown}
    >
      <OpenDecksCard 
        card={card} 
        isDarkTheme={isDarkTheme} 
        className="card-opendecks"
      />
    </div>
  );
};
