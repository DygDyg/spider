// FLIP-аниматор для карт
// FLIP = First, Last, Invert, Play

export interface CardPosition {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FlipAnimation {
  element: HTMLElement;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  duration: number;
  easing: string;
}

class FlipAnimator {
  private positions: Map<string, CardPosition> = new Map();
  private animationSpeed = 1;
  private enabled = true;

  constructor() {
    this.loadConfig();
  }

  private loadConfig() {
    try {
      const saved = localStorage.getItem('spider_animation_config');
      if (saved) {
        const config = JSON.parse(saved);
        this.enabled = config.enabled !== false;
        this.animationSpeed = config.speed === 'fast' ? 0.5 : config.speed === 'slow' ? 2 : 1;
      }
    } catch (e) {
      // ignore
    }
  }

  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  public setSpeed(speed: string) {
    this.animationSpeed = speed === 'fast' ? 0.5 : speed === 'slow' ? 2 : 1;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  // Захват позиций всех карт (First)
  public capturePositions(container: HTMLElement): void {
    this.positions.clear();
    const cardElements = container.querySelectorAll('[data-card-id]');
    cardElements.forEach((el) => {
      const id = el.getAttribute('data-card-id');
      if (id) {
        const rect = el.getBoundingClientRect();
        this.positions.set(id, {
          id,
          x: rect.left,
          y: rect.top,
          width: rect.width,
          height: rect.height,
        });
      }
    });
  }

  // Получить сохранённую позицию карты
  public getPosition(id: string): CardPosition | undefined {
    return this.positions.get(id);
  }

  // Анимация перемещения карты от старой позиции к новой (FLIP)
  public animateCardMove(
    element: HTMLElement,
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    duration?: number
  ): Promise<void> {
    return new Promise((resolve) => {
      if (!this.enabled) {
        resolve();
        return;
      }

      const actualDuration = (duration || 250) * this.animationSpeed;
      const deltaX = fromX - toX;
      const deltaY = fromY - toY;

      // Invert: применяем обратное смещение
      element.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
      element.style.transition = 'none';
      element.style.willChange = 'transform';
      element.style.zIndex = '1000';

      // Play: анимируем к конечной позиции
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          element.style.transition = `transform ${actualDuration}ms cubic-bezier(0.22, 1, 0.36, 1)`;
          element.style.transform = 'translate(0, 0)';

          const cleanup = () => {
            element.style.transition = '';
            element.style.transform = '';
            element.style.willChange = '';
            element.style.zIndex = '';
            resolve();
          };

          element.addEventListener('transitionend', cleanup, { once: true });
          
          // Fallback на случай если transitionend не сработает
          setTimeout(cleanup, actualDuration + 50);
        });
      });
    });
  }

  // Анимация появления карты (deal)
  public animateCardDeal(
    element: HTMLElement,
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    duration?: number
  ): Promise<void> {
    return new Promise((resolve) => {
      if (!this.enabled) {
        resolve();
        return;
      }

      const actualDuration = (duration || 300) * this.animationSpeed;
      const deltaX = fromX - toX;
      const deltaY = fromY - toY;

      element.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(0.8)`;
      element.style.opacity = '0.5';
      element.style.transition = 'none';
      element.style.willChange = 'transform, opacity';
      element.style.zIndex = '1000';

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          element.style.transition = `transform ${actualDuration}ms cubic-bezier(0.22, 1, 0.36, 1), opacity ${actualDuration}ms ease`;
          element.style.transform = 'translate(0, 0) scale(1)';
          element.style.opacity = '1';

          const cleanup = () => {
            element.style.transition = '';
            element.style.transform = '';
            element.style.opacity = '';
            element.style.willChange = '';
            element.style.zIndex = '';
            resolve();
          };

          element.addEventListener('transitionend', cleanup, { once: true });
          setTimeout(cleanup, actualDuration + 50);
        });
      });
    });
  }

  // Анимация переворота карты
  public animateCardFlip(element: HTMLElement, duration?: number): Promise<void> {
    return new Promise((resolve) => {
      if (!this.enabled) {
        resolve();
        return;
      }

      const actualDuration = (duration || 300) * this.animationSpeed;

      element.style.transformStyle = 'preserve-3d';
      element.style.transition = `transform ${actualDuration}ms ease-in-out`;
      element.style.willChange = 'transform';

      requestAnimationFrame(() => {
        element.style.transform = 'rotateY(180deg)';

        const cleanup = () => {
          element.style.transition = '';
          element.style.transform = '';
          element.style.transformStyle = '';
          element.style.willChange = '';
          resolve();
        };

        element.addEventListener('transitionend', cleanup, { once: true });
        setTimeout(cleanup, actualDuration + 50);
      });
    });
  }

  // Анимация возврата карты (при недопустимом ходе)
  public animateCardReturn(
    element: HTMLElement,
    toX: number,
    toY: number,
    duration?: number
  ): Promise<void> {
    return new Promise((resolve) => {
      if (!this.enabled) {
        resolve();
        return;
      }

      const actualDuration = (duration || 200) * this.animationSpeed;
      const rect = element.getBoundingClientRect();
      const deltaX = toX - rect.left;
      const deltaY = toY - rect.top;

      element.style.transition = `transform ${actualDuration}ms cubic-bezier(0.22, 1, 0.36, 1)`;
      element.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
      element.style.willChange = 'transform';

      const cleanup = () => {
        element.style.transition = '';
        element.style.transform = '';
        element.style.willChange = '';
        resolve();
      };

      element.addEventListener('transitionend', cleanup, { once: true });
      setTimeout(cleanup, actualDuration + 50);
    });
  }

  // Анимация завершения последовательности
  public animateSequenceComplete(
    cards: HTMLElement[],
    targetX: number,
    targetY: number,
    duration?: number
  ): Promise<void> {
    return new Promise(async (resolve) => {
      if (!this.enabled) {
        resolve();
        return;
      }

      const actualDuration = (duration || 400) * this.animationSpeed;

      // Подсветка
      cards.forEach((card) => {
        card.style.boxShadow = '0 0 20px rgba(255, 215, 0, 0.8)';
        card.style.zIndex = '1000';
      });

      await this.delay(200);

      // Сбор в стопку и перемещение
      const promises = cards.map((card, i) => {
        return new Promise<void>((res) => {
          setTimeout(() => {
            const rect = card.getBoundingClientRect();
            const deltaX = targetX - rect.left;
            const deltaY = targetY - rect.top;

            card.style.transition = `transform ${actualDuration}ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow ${actualDuration}ms`;
            card.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(0.8)`;
            card.style.boxShadow = '0 0 10px rgba(255, 215, 0, 0.4)';

            setTimeout(res, actualDuration);
          }, i * 30);
        });
      });

      await Promise.all(promises);
      await this.delay(200);

      resolve();
    });
  }

  // Победная анимация
  public animateVictory(cards: HTMLElement[]): Promise<void> {
    return new Promise(async (resolve) => {
      if (!this.enabled) {
        resolve();
        return;
      }

      const promises = cards.map((card, i) => {
        return new Promise<void>((res) => {
          setTimeout(() => {
            const angle = (i / cards.length) * Math.PI * 2;
            const distance = 300 + Math.random() * 200;
            const x = Math.cos(angle) * distance;
            const y = Math.sin(angle) * distance;
            const rotation = Math.random() * 720 - 360;

            card.style.transition = 'transform 1500ms cubic-bezier(0.22, 1, 0.36, 1), opacity 1500ms';
            card.style.transform = `translate(${x}px, ${y}px) rotate(${rotation}deg)`;
            card.style.opacity = '0';
            card.style.zIndex = '1000';

            setTimeout(res, 1500);
          }, i * 50);
        });
      });

      await Promise.all(promises);
      resolve();
    });
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Отмена всех анимаций
  public cancelAll(container?: HTMLElement): void {
    const elements = container
      ? container.querySelectorAll('[style*="transition"]')
      : document.querySelectorAll('[style*="transition"]');
    
    elements.forEach((el) => {
      const htmlEl = el as HTMLElement;
      htmlEl.style.transition = '';
      htmlEl.style.transform = '';
      htmlEl.style.opacity = '';
      htmlEl.style.willChange = '';
      htmlEl.style.zIndex = '';
      htmlEl.style.boxShadow = '';
    });
  }
}

export const flipAnimator = new FlipAnimator();
