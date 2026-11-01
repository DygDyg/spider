import React from 'react';
import { Suit, Rank } from '../../game/types';

interface CardFaceProps {
  suit: Suit;
  rank: Rank;
  isDarkTheme: boolean;
}

// Цвета мастей для разных тем
const getSuitColor = (suit: Suit, isDarkTheme: boolean): string => {
  if (isDarkTheme) {
    // В тёмной теме: чёрные масти становятся серебристо-голубыми
    if (suit === 'spades' || suit === 'clubs') {
      return '#A8C7FA';
    }
    return '#FF6B6B'; // Красные масти остаются красными, но ярче
  }
  // В светлой теме: стандартные цвета
  if (suit === 'spades' || suit === 'clubs') {
    return '#1a1a2e';
  }
  return '#dc2626';
};

// SVG символ масти
const SuitSymbol: React.FC<{ suit: Suit; color: string; size?: number }> = ({ suit, color, size = 20 }) => {
  const symbols: Record<Suit, React.ReactNode> = {
    spades: (
      <path d="M12,2 C12,2 5,9 5,13 C5,16 7.5,17 9,17 C9,17 7.5,19 7.5,21 L16.5,21 C16.5,19 15,17 15,17 C16.5,17 19,16 19,13 C19,9 12,2 12,2 Z" />
    ),
    hearts: (
      <path d="M12,21.35 L10.55,20.03 C5.4,15.36 2,12.28 2,8.5 C2,5.42 4.42,3 7.5,3 C9.24,3 10.91,3.81 12,5.09 C13.09,3.81 14.76,3 16.5,3 C19.58,3 22,5.42 22,8.5 C22,12.28 18.6,15.36 13.45,20.03 L12,21.35 Z" />
    ),
    diamonds: (
      <path d="M12,2 L22,12 L12,22 L2,12 Z" />
    ),
    clubs: (
      <g>
        <circle cx="12" cy="7" r="4.5" />
        <circle cx="7" cy="13" r="4.5" />
        <circle cx="17" cy="13" r="4.5" />
        <path d="M10,17 L10,22 L14,22 L14,17 Z" />
      </g>
    ),
  };

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      {symbols[suit]}
    </svg>
  );
};

// Классическая раскладка для числовых карт
const NumberCardLayout: React.FC<{ suit: Suit; rank: Rank; color: string }> = ({ suit, rank, color }) => {
  const symbol = <SuitSymbol suit={suit} color={color} size={16} />;
  
  // Классические раскладки для каждого номинала
  const layouts: Record<number, React.ReactNode> = {
    2: (
      <div className="card-pips">
        <div className="pip pip-top">{symbol}</div>
        <div className="pip pip-bottom">{symbol}</div>
      </div>
    ),
    3: (
      <div className="card-pips">
        <div className="pip pip-top">{symbol}</div>
        <div className="pip pip-center">{symbol}</div>
        <div className="pip pip-bottom">{symbol}</div>
      </div>
    ),
    4: (
      <div className="card-pips">
        <div className="pip pip-top-left">{symbol}</div>
        <div className="pip pip-top-right">{symbol}</div>
        <div className="pip pip-bottom-left">{symbol}</div>
        <div className="pip pip-bottom-right">{symbol}</div>
      </div>
    ),
    5: (
      <div className="card-pips">
        <div className="pip pip-top-left">{symbol}</div>
        <div className="pip pip-top-right">{symbol}</div>
        <div className="pip pip-center">{symbol}</div>
        <div className="pip pip-bottom-left">{symbol}</div>
        <div className="pip pip-bottom-right">{symbol}</div>
      </div>
    ),
    6: (
      <div className="card-pips">
        <div className="pip pip-top-left">{symbol}</div>
        <div className="pip pip-top-right">{symbol}</div>
        <div className="pip pip-middle-left">{symbol}</div>
        <div className="pip pip-middle-right">{symbol}</div>
        <div className="pip pip-bottom-left">{symbol}</div>
        <div className="pip pip-bottom-right">{symbol}</div>
      </div>
    ),
    7: (
      <div className="card-pips">
        <div className="pip pip-top-left">{symbol}</div>
        <div className="pip pip-top-right">{symbol}</div>
        <div className="pip pip-top-center">{symbol}</div>
        <div className="pip pip-middle-left">{symbol}</div>
        <div className="pip pip-middle-right">{symbol}</div>
        <div className="pip pip-bottom-left">{symbol}</div>
        <div className="pip pip-bottom-right">{symbol}</div>
      </div>
    ),
    8: (
      <div className="card-pips">
        <div className="pip pip-top-left">{symbol}</div>
        <div className="pip pip-top-right">{symbol}</div>
        <div className="pip pip-top-center">{symbol}</div>
        <div className="pip pip-middle-left">{symbol}</div>
        <div className="pip pip-middle-right">{symbol}</div>
        <div className="pip pip-bottom-left">{symbol}</div>
        <div className="pip pip-bottom-right">{symbol}</div>
        <div className="pip pip-bottom-center">{symbol}</div>
      </div>
    ),
    9: (
      <div className="card-pips">
        <div className="pip pip-top-left">{symbol}</div>
        <div className="pip pip-top-right">{symbol}</div>
        <div className="pip pip-top-center">{symbol}</div>
        <div className="pip pip-middle-left">{symbol}</div>
        <div className="pip pip-middle-right">{symbol}</div>
        <div className="pip pip-middle-center">{symbol}</div>
        <div className="pip pip-bottom-left">{symbol}</div>
        <div className="pip pip-bottom-right">{symbol}</div>
        <div className="pip pip-bottom-center">{symbol}</div>
      </div>
    ),
    10: (
      <div className="card-pips">
        <div className="pip pip-top-left">{symbol}</div>
        <div className="pip pip-top-right">{symbol}</div>
        <div className="pip pip-top-center">{symbol}</div>
        <div className="pip pip-middle-top">{symbol}</div>
        <div className="pip pip-middle-left">{symbol}</div>
        <div className="pip pip-middle-right">{symbol}</div>
        <div className="pip pip-middle-bottom">{symbol}</div>
        <div className="pip pip-bottom-left">{symbol}</div>
        <div className="pip pip-bottom-right">{symbol}</div>
        <div className="pip pip-bottom-center">{symbol}</div>
      </div>
    ),
  };

  return layouts[rank] || null;
};

// SVG для Валета
const JackSVG: React.FC<{ suit: Suit; color: string }> = ({ suit, color }) => {
  return (
    <svg viewBox="0 0 60 80" className="face-card-svg">
      {/* Фон */}
      <rect x="0" y="0" width="60" height="80" fill="none"/>
      
      {/* Голова */}
      <ellipse cx="30" cy="22" rx="9" ry="10" fill={color} opacity="0.25"/>
      <ellipse cx="30" cy="22" rx="7" ry="8" fill={color} opacity="0.35"/>
      
      {/* Шляпа */}
      <path d="M20,16 L24,8 L30,12 L36,8 L40,16 Z" fill={color} opacity="0.5"/>
      <ellipse cx="30" cy="16" rx="12" ry="2" fill={color} opacity="0.6"/>
      
      {/* Шея */}
      <rect x="27" y="30" width="6" height="5" fill={color} opacity="0.2"/>
      
      {/* Тело/туника */}
      <path d="M20,35 L22,60 L38,60 L40,35 Z" fill={color} opacity="0.3"/>
      
      {/* Воротник */}
      <path d="M20,35 L30,42 L40,35" fill="none" stroke={color} strokeWidth="2" opacity="0.6"/>
      
      {/* Пояс */}
      <rect x="20" y="48" width="20" height="3" fill={color} opacity="0.4"/>
      
      {/* Символ масти на груди */}
      <g transform="translate(30, 42) scale(0.5)">
        <SuitSymbol suit={suit} color={color} size={20} />
      </g>
      
      {/* Руки */}
      <path d="M20,35 L14,45 L16,55" fill="none" stroke={color} strokeWidth="3" opacity="0.25" strokeLinecap="round"/>
      <path d="M40,35 L46,45 L44,55" fill="none" stroke={color} strokeWidth="3" opacity="0.25" strokeLinecap="round"/>
      
      {/* Ноги */}
      <rect x="24" y="60" width="5" height="12" fill={color} opacity="0.2"/>
      <rect x="31" y="60" width="5" height="12" fill={color} opacity="0.2"/>
      
      {/* Буква J */}
      <text x="30" y="76" textAnchor="middle" fontSize="10" fontWeight="bold" fill={color} opacity="0.8">J</text>
    </svg>
  );
};

// SVG для Дамы
const QueenSVG: React.FC<{ suit: Suit; color: string }> = ({ suit, color }) => {
  return (
    <svg viewBox="0 0 60 80" className="face-card-svg">
      {/* Голова */}
      <ellipse cx="30" cy="22" rx="9" ry="10" fill={color} opacity="0.25"/>
      <ellipse cx="30" cy="22" rx="7" ry="8" fill={color} opacity="0.35"/>
      
      {/* Волосы */}
      <path d="M21,18 Q18,25 21,32" fill="none" stroke={color} strokeWidth="2" opacity="0.3"/>
      <path d="M39,18 Q42,25 39,32" fill="none" stroke={color} strokeWidth="2" opacity="0.3"/>
      
      {/* Корона */}
      <path d="M20,15 L23,8 L27,13 L30,6 L33,13 L37,8 L40,15 Z" fill={color} opacity="0.6"/>
      <ellipse cx="30" cy="15" rx="11" ry="2" fill={color} opacity="0.5"/>
      <circle cx="30" cy="6" r="2" fill={color} opacity="0.8"/>
      <circle cx="23" cy="8" r="1" fill={color} opacity="0.7"/>
      <circle cx="37" cy="8" r="1" fill={color} opacity="0.7"/>
      
      {/* Шея */}
      <rect x="27" y="30" width="6" height="5" fill={color} opacity="0.2"/>
      
      {/* Платье */}
      <path d="M18,35 L20,65 L40,65 L42,35 Z" fill={color} opacity="0.3"/>
      
      {/* Воротник/ожерелье */}
      <ellipse cx="30" cy="35" rx="12" ry="3" fill={color} opacity="0.35"/>
      
      {/* Пояс */}
      <rect x="18" y="48" width="24" height="2" fill={color} opacity="0.4"/>
      
      {/* Символ масти */}
      <g transform="translate(30, 43) scale(0.5)">
        <SuitSymbol suit={suit} color={color} size={20} />
      </g>
      
      {/* Руки */}
      <path d="M18,35 L12,48 L14,58" fill="none" stroke={color} strokeWidth="3" opacity="0.25" strokeLinecap="round"/>
      <path d="M42,35 L48,48 L46,58" fill="none" stroke={color} strokeWidth="3" opacity="0.25" strokeLinecap="round"/>
      
      {/* Цветок в руке */}
      <circle cx="12" cy="48" r="3" fill={color} opacity="0.4"/>
      
      {/* Буква Q */}
      <text x="30" y="76" textAnchor="middle" fontSize="10" fontWeight="bold" fill={color} opacity="0.8">Q</text>
    </svg>
  );
};

// SVG для Короля
const KingSVG: React.FC<{ suit: Suit; color: string }> = ({ suit, color }) => {
  return (
    <svg viewBox="0 0 60 80" className="face-card-svg">
      {/* Голова */}
      <ellipse cx="30" cy="22" rx="10" ry="11" fill={color} opacity="0.25"/>
      <ellipse cx="30" cy="22" rx="8" ry="9" fill={color} opacity="0.35"/>
      
      {/* Борода */}
      <path d="M24,26 Q30,32 36,26" fill={color} opacity="0.2"/>
      
      {/* Большая корона */}
      <path d="M16,14 L20,6 L25,11 L30,4 L35,11 L40,6 L44,14 Z" fill={color} opacity="0.7"/>
      <ellipse cx="30" cy="14" rx="15" ry="3" fill={color} opacity="0.6"/>
      <circle cx="30" cy="4" r="2.5" fill={color} opacity="0.9"/>
      <circle cx="20" cy="6" r="1.5" fill={color} opacity="0.8"/>
      <circle cx="40" cy="6" r="1.5" fill={color} opacity="0.8"/>
      
      {/* Шея */}
      <rect x="26" y="31" width="8" height="5" fill={color} opacity="0.2"/>
      
      {/* Мантия/туника */}
      <path d="M16,36 L18,68 L42,68 L44,36 Z" fill={color} opacity="0.35"/>
      
      {/* Воротник/мех */}
      <path d="M16,36 Q30,44 44,36" fill="none" stroke={color} strokeWidth="3" opacity="0.5"/>
      <ellipse cx="30" cy="36" rx="14" ry="4" fill={color} opacity="0.3"/>
      
      {/* Пояс */}
      <rect x="16" y="50" width="28" height="3" fill={color} opacity="0.45"/>
      
      {/* Символ масти */}
      <g transform="translate(30, 45) scale(0.6)">
        <SuitSymbol suit={suit} color={color} size={20} />
      </g>
      
      {/* Скипетр слева */}
      <rect x="8" y="36" width="3" height="32" fill={color} opacity="0.5"/>
      <circle cx="9.5" cy="36" r="4" fill={color} opacity="0.6"/>
      <path d="M9.5,32 L9.5,28" stroke={color} strokeWidth="2" opacity="0.7"/>
      
      {/* Держава справа */}
      <rect x="49" y="40" width="3" height="28" fill={color} opacity="0.5"/>
      <circle cx="50.5" cy="40" r="5" fill={color} opacity="0.6"/>
      <rect x="48" y="35" width="5" height="5" fill={color} opacity="0.7"/>
      <path d="M50.5,35 L50.5,30" stroke={color} strokeWidth="1.5" opacity="0.8"/>
      <circle cx="50.5" cy="30" r="1.5" fill={color} opacity="0.9"/>
      
      {/* Руки */}
      <path d="M16,36 L10,48 L12,58" fill="none" stroke={color} strokeWidth="3.5" opacity="0.25" strokeLinecap="round"/>
      <path d="M44,36 L50,48 L48,58" fill="none" stroke={color} strokeWidth="3.5" opacity="0.25" strokeLinecap="round"/>
      
      {/* Буква K */}
      <text x="30" y="76" textAnchor="middle" fontSize="10" fontWeight="bold" fill={color} opacity="0.8">K</text>
    </svg>
  );
};

// Компонент для фигурных карт
const FaceCardLayout: React.FC<{ suit: Suit; rank: Rank; color: string }> = ({ suit, rank, color }) => {
  if (rank === 11) return <JackSVG suit={suit} color={color} />;
  if (rank === 12) return <QueenSVG suit={suit} color={color} />;
  if (rank === 13) return <KingSVG suit={suit} color={color} />;
  return null;
};

// Компонент для Туза
const AceLayout: React.FC<{ suit: Suit; color: string }> = ({ suit, color }) => {
  return (
    <div className="card-pips ace-layout">
      <div className="pip pip-center-large">
        <SuitSymbol suit={suit} color={color} size={40} />
      </div>
    </div>
  );
};

export const CardFace: React.FC<CardFaceProps> = ({ suit, rank, isDarkTheme }) => {
  const color = getSuitColor(suit, isDarkTheme);

  if (rank === 1) {
    return <AceLayout suit={suit} color={color} />;
  }
  
  if (rank >= 2 && rank <= 10) {
    return <NumberCardLayout suit={suit} rank={rank} color={color} />;
  }
  
  if (rank >= 11 && rank <= 13) {
    return <FaceCardLayout suit={suit} rank={rank} color={color} />;
  }
  
  return null;
};
