import React from 'react';
import { Suit, Rank } from '../../game/types';
import { getNumberCardSVG, getAceCardSVG, getFaceCardSVG, getFaceCardGradients } from './cardSVGs';

interface CardFaceProps {
  suit: Suit;
  rank: Rank;
  color: string;
}

// viewBox всей карты: 100 x 140 (соотношение 5:7)
const VW = 100;
const VH = 140;

export const CardFace: React.FC<CardFaceProps> = ({ suit, rank, color }) => {
  const rankStr = rank === 1 ? 'A' : rank === 11 ? 'J' : rank === 12 ? 'Q' : rank === 13 ? 'K' : String(rank);
  const cornerSuitSize = 10;
  const cornerRankSize = 12;

  // Получаем SVG-содержимое для центральной части карты
  let centerContent = '';
  if (rank === 1) {
    centerContent = getAceCardSVG(suit, color);
  } else if (rank >= 2 && rank <= 10) {
    centerContent = getNumberCardSVG(suit, rank, color);
  } else if (rank >= 11 && rank <= 13) {
    centerContent = getFaceCardSVG(suit, rank);
  }

  return (
    <>
      {/* Градиенты для фигурных карт */}
      {rank >= 11 && rank <= 13 && (
        <g dangerouslySetInnerHTML={{ __html: getFaceCardGradients() }} />
      )}

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
      <g transform={`translate(12, 22) scale(${cornerSuitSize / 24}) translate(-12, -12)`}>
        <path
          d={
            suit === 'spades'
              ? 'M12,2 C12,2 4,10 4,14 C4,17 6.5,18 8.5,18 C8.5,18 7,20 7,22 L17,22 C17,20 15.5,18 15.5,18 C17.5,18 20,17 20,14 C20,10 12,2 12,2 Z'
              : suit === 'hearts'
              ? 'M12,21.35 L10.55,20.03 C5.4,15.36 2,12.28 2,8.5 C2,5.42 4.42,3 7.5,3 C9.24,3 10.91,3.81 12,5.09 C13.09,3.81 14.76,3 16.5,3 C19.58,3 22,5.42 22,8.5 C22,12.28 18.6,15.36 13.45,20.03 L12,21.35 Z'
              : suit === 'diamonds'
              ? 'M12,2 L22,12 L12,22 L2,12 Z'
              : 'M12,2 C9.24,2 7,4.24 7,7 C7,8.5 7.7,9.8 8.8,10.7 C7.3,11.1 6,12.4 6,14 C6,16.2 7.8,18 10,18 C10.3,18 10.6,17.9 10.9,17.8 C10.3,18.5 10,19.4 10,20.5 L14,20.5 C14,19.4 13.7,18.5 13.1,17.8 C13.4,17.9 13.7,18 14,18 C16.2,18 18,16.2 18,14 C18,12.4 16.7,11.1 15.2,10.7 C16.3,9.8 17,8.5 17,7 C17,4.24 14.76,2 12,2 Z'
          }
          fill={color}
        />
      </g>

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
        <g transform={`translate(12, 22) scale(${cornerSuitSize / 24}) translate(-12, -12)`}>
          <path
            d={
              suit === 'spades'
                ? 'M12,2 C12,2 4,10 4,14 C4,17 6.5,18 8.5,18 C8.5,18 7,20 7,22 L17,22 C17,20 15.5,18 15.5,18 C17.5,18 20,17 20,14 C20,10 12,2 12,2 Z'
                : suit === 'hearts'
                ? 'M12,21.35 L10.55,20.03 C5.4,15.36 2,12.28 2,8.5 C2,5.42 4.42,3 7.5,3 C9.24,3 10.91,3.81 12,5.09 C13.09,3.81 14.76,3 16.5,3 C19.58,3 22,5.42 22,8.5 C22,12.28 18.6,15.36 13.45,20.03 L12,21.35 Z'
                : suit === 'diamonds'
                ? 'M12,2 L22,12 L12,22 L2,12 Z'
                : 'M12,2 C9.24,2 7,4.24 7,7 C7,8.5 7.7,9.8 8.8,10.7 C7.3,11.1 6,12.4 6,14 C6,16.2 7.8,18 10,18 C10.3,18 10.6,17.9 10.9,17.8 C10.3,18.5 10,19.4 10,20.5 L14,20.5 C14,19.4 13.7,18.5 13.1,17.8 C13.4,17.9 13.7,18 14,18 C16.2,18 18,16.2 18,14 C18,12.4 16.7,11.1 15.2,10.7 C16.3,9.8 17,8.5 17,7 C17,4.24 14.76,2 12,2 Z'
            }
            fill={color}
          />
        </g>
      </g>

      {/* Центральное содержимое */}
      <g dangerouslySetInnerHTML={{ __html: centerContent }} />
    </>
  );
};
