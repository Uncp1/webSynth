import * as Tone from 'tone';
import { OscillatorModuleProps } from './types';
import { getOscillatorType } from './utils';

/**
 * Обновляет параметры осцилляторов
 */
export const updateOscillators = ({
  synth1,
  synth2,
  vcaSettings,
}: OscillatorModuleProps): void => {
  // Обновляем осциллятор 1
  synth1.set({
    oscillator: {
      type: getOscillatorType(vcaSettings.oscillator1Type, vcaSettings.isFat1),
      count: vcaSettings.isFat1 ? 3 : 1, // Количество голосов для "fat" звука
      spread: vcaSettings.isFat1 ? vcaSettings.spread1 : 0, // Применяем spread только в fat-режиме
      // Обрабатываем pulse width при необходимости
      width:
        vcaSettings.oscillator1Type === 'pulse' ||
        vcaSettings.oscillator1Type === 'pwm'
          ? vcaSettings.pulseWidth1
          : undefined,
      // Устанавливаем фазу
      phase: vcaSettings.phase1,
    },
  });

  // Обновляем осциллятор 2
  synth2.set({
    oscillator: {
      type: getOscillatorType(vcaSettings.oscillator2Type, vcaSettings.isFat2),
      count: vcaSettings.isFat2 ? 3 : 1, // Количество голосов для "fat" звука
      spread: vcaSettings.isFat2 ? vcaSettings.spread2 : 0, // Применяем spread только в fat-режиме
      // Обрабатываем pulse width при необходимости
      width:
        vcaSettings.oscillator2Type === 'pulse' ||
        vcaSettings.oscillator2Type === 'pwm'
          ? vcaSettings.pulseWidth2
          : undefined,
      // Устанавливаем фазу
      phase: vcaSettings.phase2,
    },
  });
};

/**
 * Обновляет расстройку (detune) осцилляторов
 */
export const updateOscillatorTuning = ({
  synth1,
  synth2,
  vcaSettings,
}: OscillatorModuleProps): void => {
  // Detune в центах (100 центов = 1 полутон)
  // Объединяем точную расстройку (detune) с полутоновым сдвигом (semitone)
  const totalDetune1 = vcaSettings.detune1 + vcaSettings.semitone1 * 100;
  const totalDetune2 = vcaSettings.detune2 + vcaSettings.semitone2 * 100;

  synth1.set({
    detune: totalDetune1,
  });

  synth2.set({
    detune: totalDetune2,
  });
};

/**
 * Обновляет параметры огибающих для осцилляторов
 */
export const updateOscillatorEnvelopes = ({
  synth1,
  vcaSettings,
}: OscillatorModuleProps): void => {
  // Обновляем параметры огибающей для синтезатора 1
  synth1.set({
    envelope: {
      attack: vcaSettings.envelope1Attack,
      decay: vcaSettings.envelope1Decay,
      sustain: vcaSettings.envelope1Sustain,
      release: vcaSettings.envelope1Release,
    },
  });
};
