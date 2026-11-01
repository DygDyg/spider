import React, { useState, useEffect } from 'react';
import { Difficulty, DIFFICULTY_NAMES, Settings, GameStats, GameState } from '../../game/types';

// Модальное окно выбора сложности
interface DifficultyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStart: (difficulty: Difficulty) => void;
  hasActiveGame: boolean;
}

export const DifficultyModal: React.FC<DifficultyModalProps> = ({ isOpen, onClose, onStart, hasActiveGame }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Новая игра</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {hasActiveGame && (
            <p className="modal-warning">
              ⚠️ Текущая партия будет заменена новой.
            </p>
          )}
          <div className="difficulty-options">
            <button className="difficulty-btn difficulty-easy" onClick={() => onStart(1)}>
              <div className="difficulty-icon">♠</div>
              <div className="difficulty-info">
                <h3>Лёгкий</h3>
                <p>1 масть (пики)</p>
                <span className="difficulty-desc">Для начинающих</span>
              </div>
            </button>
            <button className="difficulty-btn difficulty-medium" onClick={() => onStart(2)}>
              <div className="difficulty-icon">♠♥</div>
              <div className="difficulty-info">
                <h3>Средний</h3>
                <p>2 масти (пики, черви)</p>
                <span className="difficulty-desc">Стандартная сложность</span>
              </div>
            </button>
            <button className="difficulty-btn difficulty-hard" onClick={() => onStart(4)}>
              <div className="difficulty-icon">♠♥♦♣</div>
              <div className="difficulty-info">
                <h3>Сложный</h3>
                <p>4 масти</p>
                <span className="difficulty-desc">Для опытных игроков</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Модальное окно настроек
interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
  onUpdate: (settings: Partial<Settings>) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onUpdate }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-settings" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Настройки</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="settings-group">
            <label className="settings-label">Тема оформления</label>
            <div className="theme-options">
              {(['classic', 'dark', 'blue', 'light'] as const).map(theme => (
                <button
                  key={theme}
                  className={`theme-btn ${settings.theme === theme ? 'active' : ''} theme-${theme}`}
                  onClick={() => onUpdate({ theme })}
                >
                  {theme === 'classic' ? 'Классическая' : 
                   theme === 'dark' ? 'Тёмная' : 
                   theme === 'blue' ? 'Синяя' : 'Светлая'}
                </button>
              ))}
            </div>
          </div>
          
          <div className="settings-group">
            <label className="settings-label">Колода карт</label>
            <div className="size-options">
              <button className={`size-btn ${settings.cardDeck !== 'classic' ? 'active' : ''}`} onClick={() => onUpdate({cardDeck:'opendecks'})}>OpenDecks</button>
              <button className={`size-btn ${settings.cardDeck === 'classic' ? 'active' : ''}`} onClick={() => onUpdate({cardDeck:'classic'})}>Классические ♠ ♣ ♥ ♦</button>
            </div>
          </div>
          <div className="settings-group">
            <label className="settings-label">Анимации</label>
            <label className="settings-toggle">
              <input
                type="checkbox"
                checked={settings.animations}
                onChange={e => onUpdate({ animations: e.target.checked })}
              />
              <span>Включить анимации</span>
            </label>
            {settings.animations && (
              <>
                <label className="settings-label" style={{ marginTop: '10px', fontSize: '13px' }}>Скорость анимаций</label>
                <div className="size-options">
                  {(['fast', 'normal', 'slow'] as const).map(speed => (
                    <button
                      key={speed}
                      className={`size-btn ${settings.animationSpeed === speed ? 'active' : ''}`}
                      onClick={() => onUpdate({ animationSpeed: speed })}
                    >
                      {speed === 'fast' ? 'Быстрая' : speed === 'normal' ? 'Нормальная' : 'Медленная'}
                    </button>
                  ))}
                </div>
                <label className="settings-toggle" style={{ marginTop: '10px' }}>
                  <input
                    type="checkbox"
                    checked={settings.dealAnimation}
                    onChange={e => onUpdate({ dealAnimation: e.target.checked })}
                  />
                  <span>Анимация раздачи</span>
                </label>
                <label className="settings-toggle">
                  <input
                    type="checkbox"
                    checked={settings.moveAnimation}
                    onChange={e => onUpdate({ moveAnimation: e.target.checked })}
                  />
                  <span>Анимация перемещения карт</span>
                </label>
                <label className="settings-toggle">
                  <input
                    type="checkbox"
                    checked={settings.completeAnimation}
                    onChange={e => onUpdate({ completeAnimation: e.target.checked })}
                  />
                  <span>Анимация завершения последовательностей</span>
                </label>
              </>
            )}
          </div>

          <div className="settings-group">
            <label className="settings-label">Звуки</label>
            <label className="settings-toggle">
              <input
                type="checkbox"
                checked={settings.sound}
                onChange={e => onUpdate({ sound: e.target.checked })}
              />
              <span>Включить звуки</span>
            </label>
            {settings.sound && (
              <>
                <label className="settings-label" style={{ marginTop: '10px', fontSize: '13px' }}>
                  Громкость: {settings.soundVolume}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.soundVolume}
                  onChange={e => onUpdate({ soundVolume: parseInt(e.target.value) })}
                  style={{ width: '100%', marginTop: '5px' }}
                />
                <label className="settings-toggle" style={{ marginTop: '10px' }}>
                  <input
                    type="checkbox"
                    checked={settings.cardSounds}
                    onChange={e => onUpdate({ cardSounds: e.target.checked })}
                  />
                  <span>Звуки карт</span>
                </label>
                <label className="settings-toggle">
                  <input
                    type="checkbox"
                    checked={settings.interfaceSounds}
                    onChange={e => onUpdate({ interfaceSounds: e.target.checked })}
                  />
                  <span>Звуки интерфейса</span>
                </label>
                <label className="settings-toggle">
                  <input
                    type="checkbox"
                    checked={settings.victorySounds}
                    onChange={e => onUpdate({ victorySounds: e.target.checked })}
                  />
                  <span>Звуки победы</span>
                </label>
              </>
            )}
          </div>

          <div className="settings-group">
            <label className="settings-toggle">
              <input
                type="checkbox"
                checked={settings.highlightMoves}
                onChange={e => onUpdate({ highlightMoves: e.target.checked })}
              />
              <span>Подсветка возможных ходов</span>
            </label>
          </div>

          <div className="settings-group">
            <label className="settings-toggle">
              <input
                type="checkbox"
                checked={settings.showTimer}
                onChange={e => onUpdate({ showTimer: e.target.checked })}
              />
              <span>Показывать таймер</span>
            </label>
          </div>

          <div className="settings-group">
            <label className="settings-label">Размер карт</label>
            <div className="size-options">
              {(['auto', 'small', 'medium', 'large'] as const).map(size => (
                <button
                  key={size}
                  className={`size-btn ${settings.cardSize === size ? 'active' : ''}`}
                  onClick={() => onUpdate({ cardSize: size })}
                >
                  {size === 'auto' ? 'Авто' : size === 'small' ? 'Маленькие' : size === 'medium' ? 'Средние' : 'Большие'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Модальное окно статистики
interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: Record<Difficulty, GameStats>;
  onReset: () => void;
}

export const StatsModal: React.FC<StatsModalProps> = ({ isOpen, onClose, stats, onReset }) => {
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    if (!isOpen) setConfirmReset(false);
  }, [isOpen]);

  if (!isOpen) return null;

  function formatTime(seconds: number | null): string {
    if (seconds === null) return '—';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-stats" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Статистика</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {([1, 2, 4] as Difficulty[]).map(diff => (
            <div key={diff} className="stats-difficulty">
              <h3>{DIFFICULTY_NAMES[diff]}</h3>
              <div className="stats-grid">
                <div className="stat-box">
                  <span className="stat-box-value">{stats[diff]?.gamesStarted || 0}</span>
                  <span className="stat-box-label">Игр начато</span>
                </div>
                <div className="stat-box">
                  <span className="stat-box-value">{stats[diff]?.gamesWon || 0}</span>
                  <span className="stat-box-label">Побед</span>
                </div>
                <div className="stat-box">
                  <span className="stat-box-value">
                    {stats[diff]?.gamesStarted ? Math.round((stats[diff].gamesWon / stats[diff].gamesStarted) * 100) : 0}%
                  </span>
                  <span className="stat-box-label">% побед</span>
                </div>
                <div className="stat-box">
                  <span className="stat-box-value">{formatTime(stats[diff]?.bestTime)}</span>
                  <span className="stat-box-label">Лучшее время</span>
                </div>
                <div className="stat-box">
                  <span className="stat-box-value">{stats[diff]?.bestMoves ?? '—'}</span>
                  <span className="stat-box-label">Мин. ходов</span>
                </div>
                <div className="stat-box">
                  <span className="stat-box-value">{stats[diff]?.bestScore ?? '—'}</span>
                  <span className="stat-box-label">Лучший счёт</span>
                </div>
              </div>
            </div>
          ))}
          
          <div className="stats-actions">
            {!confirmReset ? (
              <button className="btn-danger" onClick={() => setConfirmReset(true)}>
                Сбросить статистику
              </button>
            ) : (
              <div className="confirm-reset">
                <span>Вы уверены?</span>
                <button className="btn-danger" onClick={() => { onReset(); setConfirmReset(false); }}>Да</button>
                <button className="btn-secondary" onClick={() => setConfirmReset(false)}>Нет</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Модальное окно победы
interface VictoryModalProps {
  isOpen: boolean;
  gameState: GameState;
  elapsedTime: number;
  onClose: () => void;
  onNewGame: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({ isOpen, gameState, elapsedTime, onClose, onNewGame }) => {
  if (!isOpen) return null;

  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  return (
    <div className="modal-overlay victory-overlay" onClick={onClose}>
      <div className="modal modal-victory" onClick={e => e.stopPropagation()}>
        <div className="victory-content">
          <div className="victory-icon">🏆</div>
          <h2>Поздравляем!</h2>
          <p className="victory-subtitle">Вы собрали пасьянс!</p>
          
          <div className="victory-stats">
            <div className="victory-stat">
              <span className="victory-stat-label">Сложность</span>
              <span className="victory-stat-value">{DIFFICULTY_NAMES[gameState.difficulty]}</span>
            </div>
            <div className="victory-stat">
              <span className="victory-stat-label">Время</span>
              <span className="victory-stat-value">{formatTime(elapsedTime)}</span>
            </div>
            <div className="victory-stat">
              <span className="victory-stat-label">Ходы</span>
              <span className="victory-stat-value">{gameState.moves}</span>
            </div>
            <div className="victory-stat">
              <span className="victory-stat-label">Очки</span>
              <span className="victory-stat-value victory-score">{gameState.score}</span>
            </div>
          </div>
          
          <div className="victory-actions">
            <button className="btn-primary" onClick={onNewGame}>Сыграть снова</button>
            <button className="btn-secondary" onClick={onClose}>Закрыть</button>
          </div>
        </div>
      </div>
    </div>
  );
};
