import * as Tone from 'tone';
import { ModulationModuleProps, ModulationType } from './types';
import { safeConnect, safeDisconnect, disposeAudioNode } from './utils';

/**
 * Очищает текущую конфигурацию модуляции
 */
const clearModulation = (props: ModulationModuleProps): void => {
  const { synth1, synth2, modulationNodeRef } = props;

  // Отключаем синтезаторы от всех соединений
  safeDisconnect(synth1);
  safeDisconnect(synth2);

  // Удаляем модуляционный узел, если он существует
  if (modulationNodeRef.current) {
    disposeAudioNode(modulationNodeRef.current);
    modulationNodeRef.current = null;
  }
};

/**
 * Настраивает базовое подключение без модуляции
 */
const setupNoModulation = (props: ModulationModuleProps): void => {
  const { synth1, synth2, vca1, vca2 } = props;

  // Просто подключаем каждый синтезатор к своему VCA
  safeConnect(synth1, vca1);
  safeConnect(synth2, vca2);
};

/**
 * Настраивает кольцевую модуляцию (умножение сигналов)
 */
const setupRingModulation = (props: ModulationModuleProps): void => {
  const { synth1, synth2, vca1, vca2, vcaSettings, modulationNodeRef } = props;

  try {
    // Создаем узел умножения
    const ringMod = new Tone.Multiply();
    modulationNodeRef.current = ringMod;

    // Создаем усиление для контроля глубины модуляции
    const modulationAmount = vcaSettings.modulationAmount / 100; // Преобразуем процент в 0-1
    const ringModDepth = new Tone.Gain(modulationAmount);

    // Подключаем осциллятор 1 к первому входу умножителя
    safeConnect(synth1, ringMod);

    // Подключаем осциллятор 2 через узел усиления ко второму входу умножителя
    safeConnect(synth2, ringModDepth);
    ringModDepth.connect(ringMod.factor);

    // Выводим модулированный сигнал через VCA1
    safeConnect(ringMod, vca1);

    // Также подаем прямой сигнал осциллятора 2 на VCA2
    safeConnect(synth2, vca2);
  } catch (error) {
    console.error('Ошибка при настройке кольцевой модуляции:', error);
    // В случае ошибки, вернемся к базовому подключению
    setupNoModulation(props);
  }
};

/**
 * Настраивает частотную модуляцию
 */
const setupFrequencyModulation = (props: ModulationModuleProps): void => {
  const { synth1, synth2, vca1, vca2, vcaSettings, modulationNodeRef } = props;

  try {
    // Создаем узел усиления для модуляции частоты
    const modulationAmount = vcaSettings.modulationAmount / 100; // Преобразуем процент в 0-1
    const fmGain = new Tone.Gain(modulationAmount * 500); // Масштабируем для слышимого FM
    modulationNodeRef.current = fmGain;

    // Подключаем модулятор (synth1) напрямую к VCA1 и к частоте носителя (synth2)
    safeConnect(synth1, vca1);
    safeConnect(synth1, fmGain);
    fmGain.connect(synth2.frequency);

    // Подключаем носитель (synth2) к VCA2
    safeConnect(synth2, vca2);
  } catch (error) {
    console.error('Ошибка при настройке частотной модуляции:', error);
    // В случае ошибки, вернемся к базовому подключению
    setupNoModulation(props);
  }
};

/**
 * Настраивает жесткую синхронизацию (аппроксимация)
 */
const setupHardSync = (props: ModulationModuleProps): void => {
  const { synth1, synth2, vca1, vca2, vcaSettings, modulationNodeRef } = props;

  try {
    // Для настоящей hard sync нам нужен специальный осциллятор
    // Пока используем простую реализацию через FM
    const modulationAmount = vcaSettings.modulationAmount / 100;
    const syncGain = new Tone.Gain(modulationAmount * 10); // Меньше усиление чем для FM
    modulationNodeRef.current = syncGain;

    // Подключение похоже на FM, но с разными параметрами
    safeConnect(synth1, vca1);
    safeConnect(synth1, syncGain);
    syncGain.connect(synth2.frequency);
    safeConnect(synth2, vca2);
  } catch (error) {
    console.error('Ошибка при настройке жесткой синхронизации:', error);
    // В случае ошибки, вернемся к базовому подключению
    setupNoModulation(props);
  }
};

/**
 * Обновляет конфигурацию модуляции на основе выбранного типа
 */
export const updateModulation = (props: ModulationModuleProps): void => {
  const { vcaSettings } = props;

  // Сначала очищаем текущую модуляцию
  clearModulation(props);

  // Затем настраиваем новую модуляцию на основе выбранного типа
  switch (vcaSettings.modulationType) {
    case 'ringmod':
      setupRingModulation(props);
      break;
    case 'fm':
      setupFrequencyModulation(props);
      break;
    case 'hardsync':
      setupHardSync(props);
      break;
    case 'none':
    default:
      setupNoModulation(props);
      break;
  }

  // Подключаем VCA к фильтру
  safeConnect(props.vca1, props.filter);
  safeConnect(props.vca2, props.filter);
};

/**
 * Обновляет только глубину модуляции, не меняя тип
 */
export const updateModulationAmount = (props: ModulationModuleProps): void => {
  const { modulationNodeRef, vcaSettings } = props;

  if (!modulationNodeRef.current) return;

  const modulationAmount = vcaSettings.modulationAmount / 100;

  try {
    if (
      vcaSettings.modulationType === 'ringmod' &&
      modulationNodeRef.current instanceof Tone.Multiply
    ) {
      // Для ring mod нам нужно обновить gain входного узла, который подключен к factor
      const inputNodes = modulationNodeRef.current.inputs[1].inputs;
      if (inputNodes && inputNodes.length > 0) {
        const gainNode = inputNodes[0];
        if (gainNode instanceof Tone.Gain) {
          gainNode.gain.value = modulationAmount;
        }
      }
    } else if (modulationNodeRef.current instanceof Tone.Gain) {
      // Для FM и Hard Sync просто обновляем коэффициент усиления
      const multiplier = vcaSettings.modulationType === 'fm' ? 500 : 10;
      modulationNodeRef.current.gain.value = modulationAmount * multiplier;
    }
  } catch (error) {
    console.error('Ошибка при обновлении глубины модуляции:', error);
  }
};
