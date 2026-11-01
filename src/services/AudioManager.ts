// AudioManager - система звуковых эффектов через Web Audio API
// Все звуки синтезируются программно, не требуют внешних файлов

export type SoundType = 
  | 'cardPickup'
  | 'cardMove'
  | 'cardPlace'
  | 'cardDeal'
  | 'cardFlip'
  | 'invalidMove'
  | 'sequenceComplete'
  | 'undo'
  | 'redo'
  | 'buttonClick'
  | 'victory';

interface SoundConfig {
  enabled: boolean;
  volume: number; // 0-1
  cardSounds: boolean;
  interfaceSounds: boolean;
  victorySounds: boolean;
}

class AudioManager {
  private audioContext: AudioContext | null = null;
  private config: SoundConfig = {
    enabled: true,
    volume: 0.5,
    cardSounds: true,
    interfaceSounds: true,
    victorySounds: true,
  };
  private initialized = false;

  constructor() {
    this.loadConfig();
  }

  private loadConfig() {
    try {
      const saved = localStorage.getItem('spider_audio_config');
      if (saved) {
        this.config = { ...this.config, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.error('Failed to load audio config:', e);
    }
  }

  private saveConfig() {
    try {
      localStorage.setItem('spider_audio_config', JSON.stringify(this.config));
    } catch (e) {
      console.error('Failed to save audio config:', e);
    }
  }

  private initAudioContext() {
    if (!this.audioContext) {
      try {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (e) {
        console.warn('Web Audio API not supported');
      }
    }
    return this.audioContext;
  }

  // Инициализация после первого взаимодействия пользователя
  public init() {
    if (!this.initialized) {
      this.initAudioContext();
      this.initialized = true;
    }
  }

  public setConfig(newConfig: Partial<SoundConfig>) {
    this.config = { ...this.config, ...newConfig };
    this.saveConfig();
  }

  public getConfig(): SoundConfig {
    return { ...this.config };
  }

  public isEnabled(): boolean {
    return this.config.enabled;
  }

  // Воспроизведение звука
  public play(soundType: SoundType) {
    if (!this.config.enabled) return;
    if (!this.initialized) this.init();
    if (!this.audioContext) return;

    // Проверка категорий звуков
    const isCardSound = ['cardPickup', 'cardMove', 'cardPlace', 'cardDeal', 'cardFlip'].includes(soundType);
    const isInterfaceSound = ['undo', 'redo', 'buttonClick', 'invalidMove'].includes(soundType);
    const isVictorySound = soundType === 'victory' || soundType === 'sequenceComplete';

    if (isCardSound && !this.config.cardSounds) return;
    if (isInterfaceSound && !this.config.interfaceSounds) return;
    if (isVictorySound && !this.config.victorySounds) return;

    const ctx = this.audioContext;
    const now = ctx.currentTime;
    const volume = this.config.volume;

    switch (soundType) {
      case 'cardPickup':
        this.playCardPickup(ctx, now, volume);
        break;
      case 'cardMove':
        this.playCardMove(ctx, now, volume);
        break;
      case 'cardPlace':
        this.playCardPlace(ctx, now, volume);
        break;
      case 'cardDeal':
        this.playCardDeal(ctx, now, volume);
        break;
      case 'cardFlip':
        this.playCardFlip(ctx, now, volume);
        break;
      case 'invalidMove':
        this.playInvalidMove(ctx, now, volume);
        break;
      case 'sequenceComplete':
        this.playSequenceComplete(ctx, now, volume);
        break;
      case 'undo':
        this.playUndo(ctx, now, volume);
        break;
      case 'redo':
        this.playRedo(ctx, now, volume);
        break;
      case 'buttonClick':
        this.playButtonClick(ctx, now, volume);
        break;
      case 'victory':
        this.playVictory(ctx, now, volume);
        break;
    }
  }

  // Шуршание при взятии карты
  private playCardPickup(ctx: AudioContext, now: number, volume: number) {
    const noise = this.createNoise(ctx, 0.08);
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 800;
    filter.Q.value = 2;
    
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume * 0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    
    noise.start(now);
    noise.stop(now + 0.08);
  }

  // Скольжение при перемещении
  private playCardMove(ctx: AudioContext, now: number, volume: number) {
    const noise = this.createNoise(ctx, 0.12);
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 600;
    
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume * 0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    
    noise.start(now);
    noise.stop(now + 0.12);
  }

  // Щелчок при укладке карты
  private playCardPlace(ctx: AudioContext, now: number, volume: number) {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.05);
    
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume * 0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.05);
  }

  // Звук раздачи карт
  private playCardDeal(ctx: AudioContext, now: number, volume: number) {
    for (let i = 0; i < 3; i++) {
      const time = now + i * 0.04;
      const noise = this.createNoise(ctx, 0.06);
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1000 + i * 200;
      
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(volume * 0.25, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + 0.06);
      
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      
      noise.start(time);
      noise.stop(time + 0.06);
    }
  }

  // Хлопок при перевороте карты
  private playCardFlip(ctx: AudioContext, now: number, volume: number) {
    const noise = this.createNoise(ctx, 0.1);
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 2000;
    
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume * 0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    
    noise.start(now);
    noise.stop(now + 0.1);
  }

  // Сигнал ошибки
  private playInvalidMove(ctx: AudioContext, now: number, volume: number) {
    const osc = ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(150, now);
    
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume * 0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.15);
  }

  // Звук завершения последовательности
  private playSequenceComplete(ctx: AudioContext, now: number, volume: number) {
    const notes = [523.25, 659.25, 783.99]; // C, E, G
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;
      
      const gain = ctx.createGain();
      const time = now + i * 0.08;
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(volume * 0.3, time + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, time + 0.3);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(time);
      osc.stop(time + 0.3);
    });
  }

  // Звук отмены
  private playUndo(ctx: AudioContext, now: number, volume: number) {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.1);
    
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume * 0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.1);
  }

  // Звук повтора
  private playRedo(ctx: AudioContext, now: number, volume: number) {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.1);
    
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume * 0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.1);
  }

  // Клик кнопки
  private playButtonClick(ctx: AudioContext, now: number, volume: number) {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 800;
    
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume * 0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.03);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.03);
  }

  // Победная мелодия
  private playVictory(ctx: AudioContext, now: number, volume: number) {
    const melody = [
      { freq: 523.25, time: 0 },     // C
      { freq: 659.25, time: 0.15 },  // E
      { freq: 783.99, time: 0.3 },   // G
      { freq: 1046.50, time: 0.45 }, // C (octave up)
    ];
    
    melody.forEach(({ freq, time }) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;
      
      const gain = ctx.createGain();
      const startTime = now + time;
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(volume * 0.3, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.4);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(startTime);
      osc.stop(startTime + 0.4);
    });
  }

  // Создание белого шума
  private createNoise(ctx: AudioContext, duration: number): AudioBufferSourceNode {
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    return source;
  }
}

// Singleton instance
export const audioManager = new AudioManager();
