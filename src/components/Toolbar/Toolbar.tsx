import React from 'react';
import { GameState, DIFFICULTY_NAMES } from '../../game/types';

interface ToolbarProps {
  gameState: GameState | null;
  elapsedTime: number;
  canUndo: boolean;
  canRedo: boolean;
  canDeal: boolean;
  onNewGame: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onHint: () => void;
  onDeal: () => void;
  onSettings: () => void;
  onStats: () => void;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  gameState,
  elapsedTime,
  canUndo,
  canRedo,
  canDeal,
  onNewGame,
  onUndo,
  onRedo,
  onHint,
  onDeal,
  onSettings,
  onStats,
}) => {
  return (
    <div className="toolbar">
      <div className="toolbar-left">
        <button className="toolbar-btn toolbar-btn-primary" onClick={onNewGame} aria-label="Новая игра">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          <span className="btn-text">Новая</span>
        </button>
        <button className="toolbar-btn" onClick={onUndo} disabled={!canUndo} aria-label="Отменить ход">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 10h10a5 5 0 0 1 0 10H9"/>
            <path d="M3 10l4-4M3 10l4 4"/>
          </svg>
          <span className="btn-text">Отмена</span>
        </button>
        <button className="toolbar-btn" onClick={onRedo} disabled={!canRedo} aria-label="Повторить ход">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 10H11a5 5 0 0 0 0 10h4"/>
            <path d="M21 10l-4-4M21 10l-4 4"/>
          </svg>
          <span className="btn-text">Повтор</span>
        </button>
        <button className="toolbar-btn" onClick={onHint} disabled={!gameState || gameState.gameOver} aria-label="Подсказка">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18h6M10 22h4"/>
            <path d="M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z"/>
          </svg>
          <span className="btn-text">Подсказка</span>
        </button>
        {gameState && gameState.stock.length > 0 && (
          <button className="toolbar-btn" onClick={onDeal} disabled={!canDeal} aria-label="Раздать карты">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="7" width="15" height="12" rx="2"/>
              <rect x="7" y="3" width="15" height="12" rx="2"/>
            </svg>
            <span className="btn-text">Раздать</span>
          </button>
        )}
      </div>
      
      <div className="toolbar-center">
        {gameState && (
          <div className="game-info">
            <span className="info-item difficulty-badge">
              {DIFFICULTY_NAMES[gameState.difficulty]}
            </span>
          </div>
        )}
      </div>

      <div className="toolbar-right">
        {gameState && (
          <div className="game-stats-bar">
            <div className="stat-item">
              <span className="stat-label">Очки</span>
              <span className="stat-value">{gameState.score}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Ходы</span>
              <span className="stat-value">{gameState.moves}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Время</span>
              <span className="stat-value">{formatTime(elapsedTime)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Собрано</span>
              <span className="stat-value">{gameState.completedSets.length}/8</span>
            </div>
          </div>
        )}
        <button className="toolbar-btn" onClick={onStats} aria-label="Статистика">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 20V10M12 20V4M6 20v-6"/>
          </svg>
        </button>
        <button className="toolbar-btn" onClick={onSettings} aria-label="Настройки">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
          </svg>
        </button>
      </div>
    </div>
  );
};
