import * as Tone from 'tone';

export const getOscillatorType = (
  type: string,
  isFat: boolean
): Tone.ToneOscillatorType => {
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
      return 'pulse' as Tone.ToneOscillatorType;
    case 'pwm':
      return 'pwm' as Tone.ToneOscillatorType;
    default:
      return `${prefix}sawtooth` as Tone.ToneOscillatorType;
  }
};
