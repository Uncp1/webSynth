import * as Tone from 'tone';

/**
 * Определяет тип осциллятора для Tone.js на основе наших типов и режима fat
 */
export const getOscillatorType = (
  type: string,
  isFat: boolean
): Tone.ToneOscillatorType => {
  // Если режим fat включен, добавляем приставку "fat" к типу
  const prefix = isFat ? 'fat' : '';

  switch (type) {
    case 'sine':
      return `${prefix}sine` as Tone.ToneOscillatorType;
    case 'sawtooth':
      return `${prefix}sawtooth` as Tone.ToneOscillatorType;
    case 'square':
      return `${prefix}square` as Tone.ToneOscillatorType;
    case 'triangle':
      return `${prefix}triangle` as Tone.ToneOscillatorType;
    case 'pulse':
      return 'pulse' as Tone.ToneOscillatorType; // Pulse не имеет fat-варианта в Tone.js
    case 'pwm':
      return 'pwm' as Tone.ToneOscillatorType; // PWM не имеет fat-варианта в Tone.js
    default:
      return `${prefix}sawtooth` as Tone.ToneOscillatorType;
  }
};

/**
 * Безопасно подключает аудио ноды, перед этим отключая их, чтобы избежать множественных подключений
 */
export const safeConnect = (
  source: Tone.ToneAudioNode,
  destination: Tone.ToneAudioNode
): void => {
  try {
    // Сначала отключаем, если уже подключено
    source.disconnect(destination);
  } catch (e) {
    // Игнорируем ошибку, если узлы еще не были соединены
  }

  // Затем подключаем заново
  source.connect(destination);
};

/**
 * Безопасно отключает все соединения аудио ноды
 */
export const safeDisconnect = (node: Tone.ToneAudioNode | null): void => {
  if (node) {
    try {
      node.disconnect();
    } catch (e) {
      console.warn('Ошибка при отключении аудио ноды', e);
    }
  }
};

/**
 * Создает уникальный ID для аудио узлов
 */
export const generateAudioNodeId = (): string => {
  return `audio-node-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Освобождает ресурсы аудио ноды (dispose)
 */
export const disposeAudioNode = (node: Tone.ToneAudioNode | null): void => {
  if (node) {
    try {
      node.dispose();
    } catch (e) {
      console.warn('Ошибка при уничтожении аудио ноды', e);
    }
  }
};
