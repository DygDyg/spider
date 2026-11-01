import React, { useEffect, useState } from 'react';
import { Card as CardType } from '../../game/types';

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
  blackSuit: '#A8C7FA', // Серебристо-голубой для пик и треф
  redSuit: '#FF6B6B',   // Ярко-красный для червей и бубн
});

export const OpenDecksCard: React.FC<OpenDecksCardProps> = ({ 
  card, 
  isDarkTheme = false, 
  className = '' 
}) => {
  const [svgContent, setSvgContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSVG = async () => {
      try {
        const rankName = getRankName(card.rank);
        const suitName = getSuitName(card.suit);
        const fileName = `${rankName} of ${suitName}.svg`;
        
        // Путь к SVG файлу
        const baseUrl = import.meta.env.BASE_URL || '/';
        const svgPath = `${baseUrl}cards/${suitName}/${fileName}`;
        
        const response = await fetch(svgPath);
        if (!response.ok) {
          throw new Error(`Failed to load SVG: ${response.status}`);
        }
        
        let svgText = await response.text();
        
        // Проверка, что это действительно SVG
        if (!svgText.includes('<svg')) {
          throw new Error('Loaded file is not a valid SVG');
        }
        
        // Для тёмной темы модифицируем цвета
        if (isDarkTheme) {
          const colors = getDarkThemeColors();
          const isBlackSuit = card.suit === 'spades' || card.suit === 'clubs';
          const targetColor = isBlackSuit ? colors.blackSuit : colors.redSuit;
          
          // Заменяем только цвета мастей и индексов, не трогая фигурные карты
          // Это простая эвристика - в реальности нужна более сложная логика
          if (card.rank <= 10 || card.rank === 1) {
            // Для числовых карт и туза можно перекрашивать
            svgText = svgText.replace(/fill="black"/g, `fill="${targetColor}"`);
            svgText = svgText.replace(/fill="#000000"/g, `fill="${targetColor}"`);
            svgText = svgText.replace(/fill="red"/g, `fill="${targetColor}"`);
            svgText = svgText.replace(/fill="#ff0000"/g, `fill="${targetColor}"`);
          }
          // Для фигурных карт (J, Q, K) оставляем оригинальные цвета
        }
        
        setSvgContent(svgText);
        setLoading(false);
      } catch (err) {
        console.error('Error loading SVG card:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setLoading(false);
      }
    };

    loadSVG();
  }, [card.suit, card.rank, isDarkTheme]);

  if (loading) {
    return (
      <div className={`opendecks-card loading ${className}`}>
        <div className="card-loading-spinner" />
      </div>
    );
  }

  if (error || !svgContent) {
    return (
      <div className={`opendecks-card error ${className}`}>
        <div className="card-error-message">Card not found</div>
      </div>
    );
  }

  return (
    <div 
      className={`opendecks-card ${className}`}
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  );
};
