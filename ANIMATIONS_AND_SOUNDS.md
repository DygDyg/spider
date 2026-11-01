# Анимации и звуки в Spider Solitaire

## Обзор

Игра включает полноценную систему анимаций и звуковых эффектов, которая делает взаимодействие с картами визуально приятным и естественным.

## Звуковые эффекты

### Реализация

Все звуки синтезируются программно через **Web Audio API**. Это обеспечивает:
- ✅ Отсутствие внешних файлов
- ✅ Мгновенную загрузку
- ✅ Работа без интернета после загрузки страницы
- ✅ Минимальный размер bundle

### AudioManager

Модуль `src/services/AudioManager.ts` управляет всеми звуковыми эффектами.

**Доступные звуки:**

| Событие | Звук | Описание |
|---------|------|----------|
| `cardPickup` | Шуршание | Лёгкое шуршание при взятии карты |
| `cardMove` | Скольжение | Мягкое скольжение при перемещении |
| `cardPlace` | Щелчок | Короткий щелчок при укладке карты |
| `cardDeal` | Раздача | Звук раскладываемых карт |
| `cardFlip` | Хлопок | Короткий бумажный хлопок при перевороте |
| `invalidMove` | Ошибка | Тихий сигнал при недопустимом ходе |
| `sequenceComplete` | Достижение | Приятный аккорд при завершении последовательности |
| `undo` | Отмена | Мягкий обратный щелчок |
| `redo` | Повтор | Обычный щелчок |
| `buttonClick` | Клик | Лёгкий интерфейсный звук |
| `victory` | Победа | Короткая победная мелодия |

### Настройка звуков

В меню настроек можно настроить:

- **Включить/выключить звуки** - общий переключатель
- **Громкость** - от 0% до 100%
- **Звуки карт** - шуршание, скольжение, щелчки
- **Звуки интерфейса** - клики кнопок, отмена/повтор
- **Звуки победы** - мелодия при завершении игры

### Инициализация

Звуки инициализируются при первом взаимодействии пользователя (клик, клавиша, касание) из-за ограничений браузера на автовоспроизведение аудио.

```typescript
// В App.tsx
useEffect(() => {
  const initAudio = () => {
    audioManager.init();
    window.removeEventListener('click', initAudio);
    window.removeEventListener('keydown', initAudio);
    window.removeEventListener('touchstart', initAudio);
  };
  
  window.addEventListener('click', initAudio);
  window.addEventListener('keydown', initAudio);
  window.addEventListener('touchstart', initAudio);
  
  return () => {
    window.removeEventListener('click', initAudio);
    window.removeEventListener('keydown', initAudio);
    window.removeEventListener('touchstart', initAudio);
  };
}, []);
```

## Анимации

### Реализация

Анимации реализованы через CSS transitions и keyframes с использованием GPU-ускоряемых свойств (`transform`, `opacity`).

### AnimationManager

Модуль `src/services/AnimationManager.ts` управляет всеми анимациями.

**Доступные анимации:**

1. **Перемещение карт** (250ms)
   - Плавное перемещение с easing `cubic-bezier(0.22, 1, 0.36, 1)`
   - Сохранение расстояний между картами в последовательности
   - Автоматический расчёт траектории

2. **Возврат карты** (200ms)
   - При недопустимом ходе карта плавно возвращается
   - Используется тот же easing для естественности

3. **Переворот карты** (300ms)
   - 3D-переворот вокруг вертикальной оси
   - `rotateY()` с `perspective`
   - Плавная смена рубашки на лицевую сторону

4. **Завершение последовательности**
   - Подсветка собранных карт
   - Сбор в стопку
   - Перемещение в область завершённых комплектов
   - Свечение в точке назначения

5. **Победная анимация**
   - Конфетти (50 частиц)
   - Карты разлетаются в разные стороны
   - Плавное исчезновение

### Настройка анимаций

В меню настроек можно настроить:

- **Включить/выключить анимации** - общий переключатель
- **Скорость анимаций**:
  - Быстрая (×0.5)
  - Нормальная (×1.0)
  - Медленная (×2.0)
- **Анимация раздачи** - анимация первоначальной раздачи карт
- **Анимация перемещения карт** - плавные перемещения
- **Анимация завершения последовательностей** - визуальные эффекты при сборе

### Поддержка prefers-reduced-motion

AnimationManager автоматически проверяет системную настройку `prefers-reduced-motion` и отключает анимации, если пользователь предпочитает уменьшенное движение.

```typescript
private checkReducedMotion() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    this.config.enabled = false;
    this.saveConfig();
  }
}
```

## CSS-анимации

### Ключевые кадры

```css
/* Появление карты */
@keyframes cardAppear {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Переворот карты */
@keyframes cardFlip {
  0% { transform: rotateY(0deg); }
  50% { transform: rotateY(90deg); }
  100% { transform: rotateY(0deg); }
}

/* Свечение при завершении */
@keyframes glowFade {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: scale(2);
  }
}

/* Падение конфетти */
@keyframes confettiFall {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotate(720deg);
    opacity: 0;
  }
}
```

### Классы анимаций

- `.card-flip` - анимация переворота
- `.card-moving` - анимация перемещения
- `.card-returning` - анимация возврата
- `.completion-glow` - свечение при завершении
- `.victory-card` - победная анимация

## Производительность

### Оптимизации

1. **GPU-ускорение**
   - Используются только `transform` и `opacity`
   - `will-change: transform` применяется временно
   - Удаление `will-change` после завершения анимации

2. **Избегание перерисовок**
   - Анимации не вызывают React re-render
   - Прямое манипулирование DOM через refs
   - Использование `requestAnimationFrame`

3. **Ограничение параллельных анимаций**
   - AnimationManager блокирует конфликтующие действия
   - Предотвращение наложения анимаций

4. **Адаптивная сложность**
   - Автоматическое упрощение при низкой производительности
   - Уважение системных настроек accessibility

### Целевая производительность

- **60 FPS** на современных устройствах
- **30+ FPS** на старых смартфонах
- **Мгновенная реакция** на действия пользователя

## Интеграция с игровым процессом

### Звуки при действиях

```typescript
// В useGame.ts
const makeMove = useCallback((fromColumn, toColumn, cardIndex) => {
  const result = moveCards(currentState, fromColumn, toColumn, cardIndex);
  if (!result) {
    audioManager.play('invalidMove');
    return false;
  }
  
  audioManager.play('cardMove');
  setTimeout(() => audioManager.play('cardPlace'), 100);
  
  if (result.newState.completedSets.length > currentState.completedSets.length) {
    setTimeout(() => audioManager.play('sequenceComplete'), 200);
  }
  
  // ... остальная логика
}, []);
```

### Анимации при действиях

Анимации интегрированы в GameBoard и автоматически запускаются при:
- Перемещении карт (drag & drop или клик)
- Раздаче из резерва
- Завершении последовательности
- Отмене/повторе хода
- Победе

## Сохранение настроек

Все настройки анимаций и звуков сохраняются в `localStorage`:

- `spider_audio_config` - настройки звуков
- `spider_animation_config` - настройки анимаций
- `spider_solitaire_settings` - общие настройки (включая новые поля)

Настройки синхронизируются между AudioManager, AnimationManager и UI.

## Тестирование

### Проверка звуков

1. Включите звуки в настройках
2. Установите громкость на 50%
3. Выполните различные действия:
   - Переместите карту
   - Отмените ход
   - Завершите последовательность
   - Выиграйте игру

### Проверка анимаций

1. Включите анимации в настройках
2. Установите скорость на "Нормальная"
3. Проверьте:
   - Плавность перемещения карт
   - Корректность переворота
   - Эффекты завершения последовательности
   - Победную анимацию

### Проверка accessibility

1. Включите `prefers-reduced-motion` в системных настройках
2. Перезагрузите страницу
3. Убедитесь, что анимации отключены

## Расширение

### Добавление новых звуков

```typescript
// В AudioManager.ts
public play(soundType: SoundType) {
  // ...
  switch (soundType) {
    case 'newSound':
      this.playNewSound(ctx, now, volume);
      break;
  }
}

private playNewSound(ctx: AudioContext, now: number, volume: number) {
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.value = 440;
  
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(volume * 0.3, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  osc.start(now);
  osc.stop(now + 0.2);
}
```

### Добавление новых анимаций

```typescript
// В AnimationManager.ts
public animateCustom(
  element: HTMLElement,
  duration: number = 300
): Promise<void> {
  return new Promise((resolve) => {
    if (!this.config.enabled) {
      resolve();
      return;
    }

    const actualDuration = this.getDuration(duration);
    element.style.willChange = 'transform';
    element.style.transition = `transform ${actualDuration}ms ease`;
    
    requestAnimationFrame(() => {
      element.style.transform = 'translateX(100px)';
    });

    setTimeout(() => {
      element.style.willChange = '';
      element.style.transition = '';
      resolve();
    }, actualDuration);
  });
}
```

## Известные ограничения

1. **Web Audio API** не поддерживается в очень старых браузерах
2. **Анимации** могут работать медленнее на слабых устройствах
3. **Конфетти** создаёт 50 DOM-элементов (может влиять на производительность)

## Будущие улучшения

- [ ] Реалистичные звуки карт (запись настоящих карт)
- [ ] Больше вариантов победной анимации
- [ ] Анимация первоначальной раздачи
- [ ] Звуки для разных тем оформления
- [ ] Настройка отдельных громкостей для каждого звука
- [ ] Эквалайзер для тонкой настройки звуков

## Лицензия

Все звуки синтезированы программно и не требуют внешних файлов или лицензий.
