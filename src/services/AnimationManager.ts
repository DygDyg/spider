// AnimationManager - управление анимациями карт

export type AnimationSpeed = 'fast' | 'normal' | 'slow';

interface AnimationConfig {
  enabled: boolean;
  speed: AnimationSpeed;
  dealAnimation: boolean;
  moveAnimation: boolean;
  completeAnimation: boolean;
}

interface AnimationTask {
  id: string;
  element: HTMLElement;
  startTime: number;
  duration: number;
  onComplete?: () => void;
}

class AnimationManager {
  private config: AnimationConfig = {
    enabled: true,
    speed: 'normal',
    dealAnimation: true,
    moveAnimation: true,
    completeAnimation: true,
  };
  
  private activeAnimations: Map<string, AnimationTask> = new Map();
  private animationFrameId: number | null = null;
  private blocked = false;

  constructor() {
    this.loadConfig();
    this.checkReducedMotion();
  }

  private loadConfig() {
    try {
      const saved = localStorage.getItem('spider_animation_config');
      if (saved) {
        this.config = { ...this.config, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.error('Failed to load animation config:', e);
    }
  }

  private saveConfig() {
    try {
      localStorage.setItem('spider_animation_config', JSON.stringify(this.config));
    } catch (e) {
      console.error('Failed to save animation config:', e);
    }
  }

  private checkReducedMotion() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.config.enabled = false;
      this.saveConfig();
    }
  }

  public setConfig(newConfig: Partial<AnimationConfig>) {
    this.config = { ...this.config, ...newConfig };
    this.saveConfig();
  }

  public getConfig(): AnimationConfig {
    return { ...this.config };
  }

  public isEnabled(): boolean {
    return this.config.enabled;
  }

  public getSpeedMultiplier(): number {
    switch (this.config.speed) {
      case 'fast': return 0.5;
      case 'slow': return 2;
      default: return 1;
    }
  }

  public getDuration(baseDuration: number): number {
    if (!this.config.enabled) return 0;
    return baseDuration * this.getSpeedMultiplier();
  }

  // Блокировка взаимодействия во время анимации
  public block() {
    this.blocked = true;
  }

  public unblock() {
    this.blocked = false;
  }

  public isBlocked(): boolean {
    return this.blocked;
  }

  // Анимация перемещения элемента
  public animateMove(
    element: HTMLElement,
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    duration: number,
    onComplete?: () => void
  ): Promise<void> {
    return new Promise((resolve) => {
      if (!this.config.enabled || !this.config.moveAnimation) {
        element.style.transform = `translate(${toX}px, ${toY}px)`;
        onComplete?.();
        resolve();
        return;
      }

      const actualDuration = this.getDuration(duration);
      const startTime = performance.now();
      const id = `move_${Date.now()}_${Math.random()}`;

      element.style.willChange = 'transform';
      element.style.transition = `transform ${actualDuration}ms cubic-bezier(0.22, 1, 0.36, 1)`;
      
      // Запускаем анимацию
      requestAnimationFrame(() => {
        element.style.transform = `translate(${toX}px, ${toY}px)`;
      });

      const task: AnimationTask = {
        id,
        element,
        startTime,
        duration: actualDuration,
        onComplete: () => {
          element.style.willChange = '';
          element.style.transition = '';
          this.activeAnimations.delete(id);
          onComplete?.();
          resolve();
        },
      };

      this.activeAnimations.set(id, task);

      setTimeout(() => {
        task.onComplete?.();
      }, actualDuration);
    });
  }

  // Анимация раздачи карт
  public async animateDeal(
    cards: HTMLElement[],
    targets: Array<{ x: number; y: number }>,
    baseDelay: number = 50
  ): Promise<void> {
    if (!this.config.enabled || !this.config.dealAnimation) {
      cards.forEach((card, i) => {
        card.style.transform = `translate(${targets[i].x}px, ${targets[i].y}px)`;
      });
      return;
    }

    this.block();

    const promises = cards.map((card, i) => {
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          this.animateMove(card, 0, 0, targets[i].x, targets[i].y, 300, resolve);
        }, i * baseDelay * this.getSpeedMultiplier());
      });
    });

    await Promise.all(promises);
    this.unblock();
  }

  // Анимация переворота карты
  public animateFlip(element: HTMLElement, duration: number = 300): Promise<void> {
    return new Promise((resolve) => {
      if (!this.config.enabled) {
        resolve();
        return;
      }

      const actualDuration = this.getDuration(duration);
      element.style.willChange = 'transform';
      element.style.transition = `transform ${actualDuration}ms ease-in-out`;
      element.style.transformStyle = 'preserve-3d';
      
      requestAnimationFrame(() => {
        element.style.transform = 'rotateY(180deg)';
      });

      setTimeout(() => {
        element.style.willChange = '';
        element.style.transition = '';
        element.style.transform = '';
        resolve();
      }, actualDuration);
    });
  }

  // Анимация завершения последовательности
  public async animateComplete(
    cards: HTMLElement[],
    targetX: number,
    targetY: number
  ): Promise<void> {
    if (!this.config.enabled || !this.config.completeAnimation) {
      return;
    }

    this.block();

    // Подсветка
    cards.forEach(card => {
      card.style.boxShadow = '0 0 20px rgba(255, 215, 0, 0.8)';
      card.style.zIndex = '1000';
    });

    await this.delay(200);

    // Сбор в стопку
    const promises = cards.map((card, i) => {
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          card.style.transition = `transform 300ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 300ms`;
          card.style.transform = `translate(${targetX}px, ${targetY}px) scale(0.8)`;
          card.style.boxShadow = '0 0 10px rgba(255, 215, 0, 0.4)';
          setTimeout(resolve, 300);
        }, i * 30);
      });
    });

    await Promise.all(promises);
    await this.delay(200);

    // Свечение в точке назначения
    const glow = document.createElement('div');
    glow.className = 'completion-glow';
    glow.style.cssText = `
      position: fixed;
      left: ${targetX}px;
      top: ${targetY}px;
      width: 100px;
      height: 100px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(255, 215, 0, 0.6) 0%, transparent 70%);
      pointer-events: none;
      z-index: 999;
      animation: glowFade 600ms ease-out forwards;
    `;
    document.body.appendChild(glow);

    setTimeout(() => glow.remove(), 600);

    this.unblock();
  }

  // Анимация возврата карты при недопустимом ходе
  public animateReturn(
    element: HTMLElement,
    toX: number,
    toY: number,
    duration: number = 200
  ): Promise<void> {
    return new Promise((resolve) => {
      if (!this.config.enabled) {
        element.style.transform = `translate(${toX}px, ${toY}px)`;
        resolve();
        return;
      }

      const actualDuration = this.getDuration(duration);
      element.style.willChange = 'transform';
      element.style.transition = `transform ${actualDuration}ms cubic-bezier(0.22, 1, 0.36, 1)`;
      
      requestAnimationFrame(() => {
        element.style.transform = `translate(${toX}px, ${toY}px)`;
      });

      setTimeout(() => {
        element.style.willChange = '';
        element.style.transition = '';
        resolve();
      }, actualDuration);
    });
  }

  // Победная анимация
  public async animateVictory(cards: HTMLElement[]): Promise<void> {
    if (!this.config.enabled) return;

    this.block();

    // Конфетти
    this.createConfetti();

    // Карты разлетаются
    const promises = cards.map((card, i) => {
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          const angle = (i / cards.length) * Math.PI * 2;
          const distance = 300 + Math.random() * 200;
          const x = Math.cos(angle) * distance;
          const y = Math.sin(angle) * distance;
          const rotation = Math.random() * 720 - 360;

          card.style.transition = 'transform 1500ms cubic-bezier(0.22, 1, 0.36, 1), opacity 1500ms';
          card.style.transform = `translate(${x}px, ${y}px) rotate(${rotation}deg)`;
          card.style.opacity = '0';

          setTimeout(resolve, 1500);
        }, i * 50);
      });
    });

    await Promise.all(promises);
    this.unblock();
  }

  private createConfetti() {
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
    const confettiCount = 50;

    for (let i = 0; i < confettiCount; i++) {
      const confetti = document.createElement('div');
      const color = colors[Math.floor(Math.random() * colors.length)];
      const startX = Math.random() * window.innerWidth;
      const endX = startX + (Math.random() - 0.5) * 200;
      const duration = 2000 + Math.random() * 1000;

      confetti.style.cssText = `
        position: fixed;
        left: ${startX}px;
        top: -20px;
        width: 10px;
        height: 10px;
        background: ${color};
        pointer-events: none;
        z-index: 10000;
        animation: confettiFall ${duration}ms ease-in forwards;
      `;

      document.body.appendChild(confetti);

      setTimeout(() => confetti.remove(), duration);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Отмена всех активных анимаций
  public cancelAll() {
    this.activeAnimations.forEach(task => {
      task.element.style.willChange = '';
      task.element.style.transition = '';
    });
    this.activeAnimations.clear();
    this.unblock();
  }
}

// Singleton instance
export const animationManager = new AnimationManager();
