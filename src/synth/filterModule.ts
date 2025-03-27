import * as Tone from 'tone';
import { FilterModuleProps } from './types';
import { safeConnect, safeDisconnect } from './utils';

/**
 * Обновляет параметры фильтра
 */
export const updateFilter = ({
  filter,
  filterSettings,
}: FilterModuleProps): void => {
  filter.set({
    type: filterSettings.type || 'lowpass',
    frequency: filterSettings.frequency,
    Q: filterSettings.Q,
  });
};

/**
 * Обновляет параметры огибающей фильтра и её подключения
 */
export const updateFilterEnvelope = ({
  filterEnvelope,
  filterEnvScaler,
  filter,
  synth2,
  vcaSettings,
  filterSettings,
}: FilterModuleProps): void => {
  // Сначала отключаем существующие соединения
  safeDisconnect(filterEnvelope);
  safeDisconnect(filterEnvScaler);

  // Обновляем параметры огибающей фильтра
  filterEnvelope.attack = vcaSettings.envelope2Attack;
  filterEnvelope.decay = vcaSettings.envelope2Decay;
  filterEnvelope.sustain = vcaSettings.envelope2Sustain;
  filterEnvelope.release = vcaSettings.envelope2Release;

  // Обновляем amount модуляции фильтра
  if (filterSettings.envelopeAmount !== undefined) {
    // Преобразуем значение из диапазона -100...100 в диапазон частот
    const modAmount = (filterSettings.envelopeAmount / 100) * 10000;
    filterEnvScaler.gain.value = modAmount;
  }

  // Подключаем огибающую к фильтру, если назначение - фильтр
  if (vcaSettings.envelope2Destination === 'filter') {
    // Подключаем огибающую к частоте фильтра через scaler
    safeConnect(filterEnvelope, filterEnvScaler);
    safeConnect(filterEnvScaler, filter.frequency);

    // Когда назначение - фильтр, используем статическую огибающую для synth2
    synth2.set({
      envelope: {
        attack: 0.01, // Быстрая атака для немедленного звука
        decay: 0.2,
        sustain: 0.8, // Высокий sustain для постоянной громкости
        release: 0.5,
      },
    });
  } else {
    // Когда назначение - VCA (по умолчанию), восстанавливаем настройки огибающей для synth2
    synth2.set({
      envelope: {
        attack: vcaSettings.envelope2Attack,
        decay: vcaSettings.envelope2Decay,
        sustain: vcaSettings.envelope2Sustain,
        release: vcaSettings.envelope2Release,
      },
    });
  }
};

/**
 * Настраивает обработчики триггера огибающей фильтра для нотных событий
 */
export const setupFilterEnvelopeTriggers = (
  { synth1, synth2, filterEnvelope, vcaSettings }: FilterModuleProps,
  activeNotesRef: React.MutableRefObject<Set<string>>
): (() => void) => {
  // Сохраняем оригинальные методы
  const origSynth1TriggerAttack = synth1.triggerAttack.bind(synth1);
  const origSynth1TriggerRelease = synth1.triggerRelease.bind(synth1);
  const origSynth2TriggerAttack = synth2.triggerAttack.bind(synth2);
  const origSynth2TriggerRelease = synth2.triggerRelease.bind(synth2);

  // Перегружаем с нашими реализациями, которые также запускают огибающую фильтра
  synth1.triggerAttack = (notes, time, velocity) => {
    origSynth1TriggerAttack(notes, time, velocity);

    // Если огибающая 2 подключена к фильтру, активируем огибающую фильтра
    if (vcaSettings.envelope2Destination === 'filter') {
      // Преобразуем ноты в массив, если это еще не массив
      const noteArray = Array.isArray(notes) ? notes : [notes];

      // Отслеживаем активные ноты
      noteArray.forEach((note) => activeNotesRef.current.add(note));

      // Запускаем огибающую только если это первая нота (чтобы избежать повторного срабатывания при полифонической игре)
      if (activeNotesRef.current.size === noteArray.length) {
        filterEnvelope.triggerAttack(time);
      }
    }

    return synth1;
  };

  synth1.triggerRelease = (notes, time) => {
    origSynth1TriggerRelease(notes, time);

    // Если огибающая 2 подключена к фильтру, обрабатываем release
    if (vcaSettings.envelope2Destination === 'filter') {
      // Преобразуем ноты в массив, если это еще не массив
      const noteArray = Array.isArray(notes) ? notes : [notes];

      // Удаляем ноты из отслеживания
      noteArray.forEach((note) => activeNotesRef.current.delete(note));

      // Запускаем release огибающей только если все ноты отпущены
      if (activeNotesRef.current.size === 0) {
        filterEnvelope.triggerRelease(time);
      }
    }

    return synth1;
  };

  // То же самое для synth2
  synth2.triggerAttack = (notes, time, velocity) => {
    origSynth2TriggerAttack(notes, time, velocity);

    // Обрабатываем только если огибающая 2 подключена к фильтру
    if (vcaSettings.envelope2Destination === 'filter') {
      const noteArray = Array.isArray(notes) ? notes : [notes];
      noteArray.forEach((note) => activeNotesRef.current.add(note));

      if (activeNotesRef.current.size === noteArray.length) {
        filterEnvelope.triggerAttack(time);
      }
    }

    return synth2;
  };

  synth2.triggerRelease = (notes, time) => {
    origSynth2TriggerRelease(notes, time);

    if (vcaSettings.envelope2Destination === 'filter') {
      const noteArray = Array.isArray(notes) ? notes : [notes];
      noteArray.forEach((note) => activeNotesRef.current.delete(note));

      if (activeNotesRef.current.size === 0) {
        filterEnvelope.triggerRelease(time);
      }
    }

    return synth2;
  };

  // Возвращаем функцию для очистки, которая восстанавливает оригинальные методы
  return () => {
    synth1.triggerAttack = origSynth1TriggerAttack;
    synth1.triggerRelease = origSynth1TriggerRelease;
    synth2.triggerAttack = origSynth2TriggerAttack;
    synth2.triggerRelease = origSynth2TriggerRelease;
  };
};
