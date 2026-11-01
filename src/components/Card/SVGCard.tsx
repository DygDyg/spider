import React, { useEffect, useState } from 'react';
import { Suit, Rank } from '../../game/types';

interface SVGCardProps {
  suit: Suit;
  rank: Rank;
  isDarkTheme?: boolean;
  className?: string;
}

// Маппинг рангов на имена файлов
const getRankName = (rank: Rank): string => {
  const names: Record<Rank, string> = {
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
  return names[rank];
};

// Маппинг мастей на имена папок
const getSuitName = (suit: Suit): string => {
  return suit; // spades, hearts, diamonds, clubs
};

// Цвета мастей для разных тем
const getSuitColors = (isDarkTheme: boolean) => {
  if (isDarkTheme) {
    return {
      // Тёмная тема: чёрные масти становятся серебристо-голубыми
      spades: '#A8C7FA',
      clubs: '#A8C7FA',
      // Красные масти остаются красными, но ярче
      hearts: '#FF6B6B',
      diamonds: '#FF6B6B',
    };
  }
  // Светлая тема: стандартные цвета
  return {
    spades: '#1a1a2e',
    clubs: '#1a1a2e',
    hearts: '#dc2626',
    diamonds: '#dc2626',
  };
};

export const SVGCard: React.FC<SVGCardProps> = ({ suit, rank, isDarkTheme = false, className = '' }) => {
  const [svgContent, setSvgContent] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSVG = async () => {
      try {
        const rankName = getRankName(rank);
        const suitName = getSuitName(suit);
        const fileName = `${rankName} of ${suitName}.svg`;
        
        // Путь к SVG файлу в public/cards/svg/
        // Используем BASE_URL для корректной работы на GitHub Pages
        const baseUrl = import.meta.env.BASE_URL || '/';
        const svgPath = `${baseUrl}cards/svg/${suitName}/${fileName}`;
        
        const response = await fetch(svgPath);
        if (!response.ok) {
          throw new Error(`Failed to load SVG: ${response.status}`);
        }
        
        let svgText = await response.text();
        
        // Заменяем цвета на CSS-переменные для настраиваемости
        const colors = getSuitColors(isDarkTheme);
        const suitColor = colors[suit];
        
        // Заменяем стандартные цвета на текущий цвет масти
        // Это позволяет динамически менять цвета через CSS
        svgText = svgText.replace(/fill="[^"]*"/g, (match) => {
          // Сохраняем белые и прозрачные fills
          if (match.includes('white') || match.includes('none') || match.includes('#fff')) {
            return match;
          }
          // Заменяем чёрные и красные fills на цвет масти
          if (match.includes('#000') || match.includes('black') || match.includes('#1a1a2e')) {
            return `fill="${suitColor}"`;
          }
          if (match.includes('#dc2626') || match.includes('red')) {
            return `fill="${suitColor}"`;
          }
          return match;
        });
        
        setSvgContent(svgText);
        setLoading(false);
      } catch (error) {
        console.error('Error loading SVG card:', error);
        setLoading(false);
      }
    };

    loadSVG();
  }, [suit, rank, isDarkTheme]);

  if (loading) {
    return <div className={`svg-card-loading ${className}`}>Loading...</div>;
  }

  if (!svgContent) {
    return <div className={`svg-card-error ${className}`}>Card not found</div>;
  }

  return (
    <div 
      className={`svg-card ${className}`}
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  );
};
