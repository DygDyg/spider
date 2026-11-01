import React from 'react';
import { Card as CardType, SUIT_SYMBOLS, SUIT_COLORS, RANK_NAMES } from '../../game/types';
import { CardFace } from './CardFace';

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
        <div className="card-back-design">
          <div className="card-back-border">
            <div className="card-back-pattern">
              <div className="card-back-diamond"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const color = isDarkTheme 
    ? (card.suit === 'spades' || card.suit === 'clubs' ? '#A8C7FA' : '#FF6B6B')
    : SUIT_COLORS[card.suit];
  const symbol = SUIT_SYMBOLS[card.suit];
  const rank = RANK_NAMES[card.rank];

  return (
    <div
      className={`card card-face ${className} ${isHighlighted ? 'card-highlighted' : ''} ${isHint ? 'card-hint' : ''}`}
      style={style}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onPointerDown={onPointerDown}
    >
      {/* Угловые обозначения */}
      <div className="card-corner card-corner-top">
        <span className="card-rank" style={{ color }}>{rank}</span>
        <span className="card-suit-small" style={{ color }}>{symbol}</span>
      </div>
      
      {/* Центральное изображение */}
      <div className="card-center">
        <CardFace suit={card.suit} rank={card.rank} isDarkTheme={isDarkTheme} />
      </div>
      
      {/* Нижний угол (перевёрнутый) */}
      <div className="card-corner card-corner-bottom">
        <span className="card-rank" style={{ color }}>{rank}</span>
        <span className="card-suit-small" style={{ color }}>{symbol}</span>
      </div>
    </div>
  );
};
