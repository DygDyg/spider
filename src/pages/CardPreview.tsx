import React, { useState } from 'react';
import { OpenDecksCard } from '../components/Card/OpenDecksCard';
import { Card } from '../game/types';

// Генерация всех 52 карт
const generateAllCards = (): Card[] => {
  const suits: Array<'spades' | 'hearts' | 'diamonds' | 'clubs'> = ['spades', 'hearts', 'diamonds', 'clubs'];
  const cards: Card[] = [];
  
  suits.forEach(suit => {
    for (let rank = 1; rank <= 13; rank++) {
      cards.push({
        id: `${suit}_${rank}`,
        suit,
        rank: rank as any,
        faceUp: true,
      });
    }
  });
  
  return cards;
};

const CardPreview: React.FC = () => {
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const cards = generateAllCards();

  return (
    <div className={`card-preview-page ${isDarkTheme ? 'theme-dark' : 'theme-classic'}`}>
      <div className="preview-header">
        <h1>🎴 Предпросмотр карт OpenDecks</h1>
        <p>Всего карт: {cards.length}</p>
        <button 
          className="theme-toggle-btn"
          onClick={() => setIsDarkTheme(!isDarkTheme)}
        >
          {isDarkTheme ? '☀️ Светлая тема' : '🌙 Тёмная тема'}
        </button>
      </div>

      <div className="preview-grid">
        {cards.map(card => (
          <div key={card.id} className="preview-card-container">
            <div className="preview-card">
              <OpenDecksCard 
                card={card} 
                isDarkTheme={isDarkTheme}
              />
            </div>
            <div className="preview-card-label">
              {card.rank === 1 ? 'A' : card.rank === 11 ? 'J' : card.rank === 12 ? 'Q' : card.rank === 13 ? 'K' : card.rank}
              {card.suit === 'spades' ? '♠' : card.suit === 'hearts' ? '♥' : card.suit === 'diamonds' ? '♦' : '♣'}
            </div>
          </div>
        ))}
      </div>

      <div className="preview-footer">
        <p>Источник: <a href="https://github.com/hhonbo/OpenDecks-Public-Domain-and-CC0-Playing-Cards" target="_blank" rel="noopener noreferrer">OpenDecks Public Domain Playing Cards</a></p>
        <p>Лицензия: CC0 1.0 Universal (Public Domain)</p>
      </div>
    </div>
  );
};

export default CardPreview;
