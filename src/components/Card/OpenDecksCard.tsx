import React, { useEffect, useState, useRef } from 'react';
import { Card as CardType } from '../../game/types';
import { CardFace } from './CardFace';

interface OpenDecksCardProps {
  card: CardType;
  isDarkTheme?: boolean;
  className?: string;
}

// Маппинг рангов на имена файлов
const getRankName = (rank: number): string => {
  const names: Record<number, string> = {
    1: 'ace',
    2: '2',
    3: '3',
    4: '4',
    5: '5',
    6: '6',
    7: '7',
    8: '8',
    9: '9',
    10: '10',
    11: 'jack',
    12: 'queen',
    13: 'king',
  };
  return names[rank] || String(rank);
};

// Маппинг мастей на имена папок
const getSuitName = (suit: string): string => {
  return suit; // spades, hearts, diamonds, clubs
};

// Цвета для тёмной темы
const getDarkThemeColors = () => ({
  blackSuit: '#A8C7FA',
  redSuit: '#FF6B6B',
});

// Кэш для загруженных SVG
const svgCache = new Map<string, string>();

export const OpenDecksCard: React.FC<OpenDecksCardProps> = ({ 
  card, 
  isDarkTheme = false, 
  className = '' 
}) => {
  const [svgContent, setSvgContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [useFallback, setUseFallback] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // Отменяем предыдущий запрос при размонтировании
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    const loadSVG = async () => {
      const rankName = getRankName(card.rank);
      const suitName = getSuitName(card.suit);
      const fileName = `${rankName} of ${suitName}.svg`;
      const baseUrl = import.meta.env.BASE_URL || '/';
      const svgPath = `${baseUrl}cards/${suitName}/${fileName}`;
      const cacheKey = `${svgPath}-${isDarkTheme}`;

      // Проверяем кэш
      if (svgCache.has(cacheKey)) {
        setSvgContent(svgCache.get(cacheKey)!);
        setLoading(false);
        setUseFallback(false);
        return;
      }

      try {
        const response = await fetch(svgPath, {
          signal: abortControllerRef.current?.signal,
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        let svgText = await response.text();
        
        // Проверка валидности SVG
        if (!svgText.includes('<svg')) {
          throw new Error('Invalid SVG format');
        }
        
        // Для тёмной темы модифицируем цвета
        if (isDarkTheme) {
          const colors = getDarkThemeColors();
          const isBlackSuit = card.suit === 'spades' || card.suit === 'clubs';
          const targetColor = isBlackSuit ? colors.blackSuit : colors.redSuit;
          
          if (card.rank <= 10 || card.rank === 1) {
            svgText = svgText.replace(/fill="black"/g, `fill="${targetColor}"`);
            svgText = svgText.replace(/fill="#000000"/g, `fill="${targetColor}"`);
            svgText = svgText.replace(/fill="red"/g, `fill="${targetColor}"`);
            svgText = svgText.replace(/fill="#ff0000"/g, `fill="${targetColor}"`);
          }
        }
        
        // Сохраняем в кэш
        svgCache.set(cacheKey, svgText);
        setSvgContent(svgText);
        setLoading(false);
        setUseFallback(false);
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return; // Запрос был отменён
        }
        
        // В режиме разработки показываем детальную ошибку
        if (import.meta.env.DEV) {
          console.warn(
            `⚠️ SVG card not found: ${svgPath}\n` +
            `Error: ${err instanceof Error ? err.message : 'Unknown error'}\n` +
            `Using fallback rendering for ${card.rank} of ${card.suit}`
          );
        }
        
        // Используем fallback
        setUseFallback(true);
        setLoading(false);
      }
    };

    loadSVG();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [card.suit, card.rank, isDarkTheme]);

  if (loading) {
    return (
      <div className={`opendecks-card loading ${className}`}>
        <div className="card-loading-spinner" />
      </div>
    );
  }

  // Fallback на встроенные SVG если внешний файл не найден
  if (useFallback || !svgContent) {
    const isBlackSuit = card.suit === 'spades' || card.suit === 'clubs';
    const fallbackColor = isDarkTheme
      ? (isBlackSuit ? '#A8C7FA' : '#FF6B6B')
      : (isBlackSuit ? '#1a1a2e' : '#dc2626');

    return (
      <svg
        viewBox="0 0 100 140"
        preserveAspectRatio="xMidYMid meet"
        className={`opendecks-card fallback ${className}`}
      >
        <rect x="0" y="0" width="100" height="140" rx="6" fill="#fffef7" />
        <CardFace suit={card.suit} rank={card.rank} color={fallbackColor} />
      </svg>
    );
  }

  return (
    <div 
      className={`opendecks-card ${className}`}
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  );
};
