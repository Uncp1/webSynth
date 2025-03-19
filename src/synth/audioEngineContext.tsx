import React, { createContext, useContext, useMemo, useEffect } from 'react';
import * as Tone from 'tone';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

interface AudioEngineContextProps {
  synth: Tone.PolySynth<Tone.AMSynth>;
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

  // Создаем полифонический синтезатор с 8 голосами при монтировании.
  const synth = useMemo(
    () =>
      new Tone.PolySynth(Tone.AMSynth, {
        //maxPolyphony: 8,
        oscillator: {
          type: 'sawtooth',
        },
        detune: synthSettings.detune,
        envelope: {
          attack: synthSettings.envelopeAttack,
          decay: synthSettings.envelopeDecay,
          sustain: synthSettings.envelopeSustain,
          release: synthSettings.envelopeRelease,
        },
        modulation: {
          type: 'sine', // значение по умолчанию для модулятора
        },
        modulationEnvelope: {
          attack: synthSettings.modulationEnvelopeAttack,
          decay: synthSettings.modulationEnvelopeDecay,
          sustain: synthSettings.modulationEnvelopeSustain,
          release: synthSettings.modulationEnvelopeRelease,
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

  // Обновление параметров синтезатора при изменении настроек
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
      modulation: {
        type: synthSettings.modulatorOscillatorType,
      },
      modulationEnvelope: {
        attack: synthSettings.modulationEnvelopeAttack,
        decay: synthSettings.modulationEnvelopeDecay,
        sustain: synthSettings.modulationEnvelopeSustain,
        release: synthSettings.modulationEnvelopeRelease,
      },
    });
  }, [synth, synthSettings]);

  // Обновление параметров фильтра при изменении настроек фильтра
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
