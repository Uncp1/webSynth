import React, { createContext, useContext, useMemo, useEffect } from 'react';
import * as Tone from 'tone';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

interface AudioEngineContextProps {
  synth: Tone.AMSynth;
  filter: Tone.Filter;
}

const AudioEngineContext = createContext<AudioEngineContextProps | null>(null);

export const AudioEngineProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const synthSettings = useSelector((state: RootState) => state.synthSettings);
  const filterSettings = useSelector(
    (state: RootState) => state.filterSettings
  );

  // Создаем экземпляры один раз при монтировании.
  const synth = useMemo(
    () =>
      new Tone.AMSynth({
        // Передаем тип осциллятора как строку, что допустимо для AMSynth
        oscillator: {
          type: 'square',
        },
        detune: synthSettings.detune,
        envelope: {
          attack: synthSettings.envelopeAttack,
          decay: synthSettings.envelopeDecay,
          sustain: synthSettings.envelopeSustain,
          release: synthSettings.envelopeRelease,
        },
      }),
    []
  );

  const filter = useMemo(
    () =>
      new Tone.Filter({
        type: filterSettings.type,
        frequency: filterSettings.frequency,
        Q: filterSettings.Q,
      }),
    []
  );

  // При изменении настроек синтезатора обновляем его параметры
  useEffect(() => {
    synth.set({
      oscillator: {
        type: synthSettings.oscillatorType,
      },
      detune: synthSettings.detune,
      envelope: {
        attack: synthSettings.envelopeAttack,
        decay: synthSettings.envelopeDecay,
        sustain: synthSettings.envelopeSustain,
        release: synthSettings.envelopeRelease,
      },
    });
  }, [synth, synthSettings]);

  // При изменении настроек фильтра обновляем его параметры
  useEffect(() => {
    filter.set({
      type: filterSettings.type,
      frequency: filterSettings.frequency,
      Q: filterSettings.Q,
    });
  }, [filter, filterSettings]);

  // Соединяем синтезатор с фильтром и выходом (Destination)
  useEffect(() => {
    synth.chain(filter, Tone.Destination);
  }, [synth, filter]);

  const contextValue: AudioEngineContextProps = { synth, filter };

  return (
    <AudioEngineContext.Provider value={contextValue}>
      {children}
    </AudioEngineContext.Provider>
  );
};

export const useAudioEngine = () => {
  const context = useContext(AudioEngineContext);
  if (!context) {
    throw new Error(
      'useAudioEngine must be used within an AudioEngineProvider'
    );
  }
  return context;
};
