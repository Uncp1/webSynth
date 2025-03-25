import React, { createContext, useContext, useMemo, useEffect } from 'react';
import * as Tone from 'tone';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

interface AudioEngineContextProps {
  synth1: Tone.PolySynth<Tone.Synth>;
  synth2: Tone.PolySynth<Tone.Synth>;
  filter: Tone.Filter;
  vca1: Tone.Volume;
  vca2: Tone.Volume;
  analyser: Tone.Analyser;
}

const AudioEngineContext = createContext<AudioEngineContextProps | null>(null);

export const AudioEngineProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const vcaSettings = useSelector((state: RootState) => state.vcaSettings);
  const filterSettings = useSelector(
    (state: RootState) => state.filterSettings
  );

  // Create two polyphonic synthesizers
  const synth1 = useMemo(
    () =>
      new Tone.PolySynth(Tone.Synth, {
        oscillator: {
          type: vcaSettings.oscillator1Type || 'sawtooth',
        },
        detune: vcaSettings.detune1 || 0,
        envelope: {
          attack: vcaSettings.envelope1Attack || 0.01,
          decay: vcaSettings.envelope1Decay || 0.2,
          sustain: vcaSettings.envelope1Sustain || 0.5,
          release: vcaSettings.envelope1Release || 1,
        },
      }),
    []
  );

  const synth2 = useMemo(
    () =>
      new Tone.PolySynth(Tone.Synth, {
        oscillator: {
          type: vcaSettings.oscillator2Type || 'square',
        },
        detune: vcaSettings.detune2 || 0,
        envelope: {
          attack: vcaSettings.envelope2Attack || 0.01,
          decay: vcaSettings.envelope2Decay || 0.2,
          sustain: vcaSettings.envelope2Sustain || 0.5,
          release: vcaSettings.envelope2Release || 1,
        },
      }),
    []
  );

  // Create VCA (Volume Control) for each synth
  const vca1 = useMemo(
    () => new Tone.Volume(vcaSettings.vca1Volume || -12),
    []
  );
  const vca2 = useMemo(
    () => new Tone.Volume(vcaSettings.vca2Volume || -12),
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

  // Create analyzer for the oscilloscope
  const analyser = useMemo(() => new Tone.Analyser('waveform', 2048), []);

  // Update synthesizer base frequency for semitone shifting
  useEffect(() => {
    // Detune is in cents (100 cents = 1 semitone)
    // We combine the fine detune with the semitone shift
    const totalDetune1 = vcaSettings.detune1 + vcaSettings.semitone1 * 100;
    const totalDetune2 = vcaSettings.detune2 + vcaSettings.semitone2 * 100;

    synth1.set({
      detune: totalDetune1,
    });

    synth2.set({
      detune: totalDetune2,
    });
  }, [
    synth1,
    synth2,
    vcaSettings.detune1,
    vcaSettings.detune2,
    vcaSettings.semitone1,
    vcaSettings.semitone2,
  ]);

  // Update synthesizer 1 parameters when settings change
  useEffect(() => {
    synth1.set({
      oscillator: {
        type: vcaSettings.oscillator1Type,
        // Handle pulse width for pulse/pwm types
        width: vcaSettings.oscillator1Type.includes('pulse')
          ? vcaSettings.pulseWidth1
          : undefined,
        // Set phase
        phase: vcaSettings.phase1,
      },
      envelope: {
        attack: vcaSettings.envelope1Attack,
        decay: vcaSettings.envelope1Decay,
        sustain: vcaSettings.envelope1Sustain,
        release: vcaSettings.envelope1Release,
      },
    });

    // Update VCA1 volume
    if (vcaSettings.vca1Volume !== undefined) {
      vca1.volume.value = vcaSettings.vca1Volume;
    }
  }, [synth1, vca1, vcaSettings]);

  // Update synthesizer 2 parameters when settings change
  useEffect(() => {
    synth2.set({
      oscillator: {
        type: vcaSettings.oscillator2Type,
        // Handle pulse width for pulse/pwm types
        width: vcaSettings.oscillator2Type.includes('pulse')
          ? vcaSettings.pulseWidth2
          : undefined,
        // Set phase
        phase: vcaSettings.phase2,
      },
      envelope: {
        attack: vcaSettings.envelope2Attack,
        decay: vcaSettings.envelope2Decay,
        sustain: vcaSettings.envelope2Sustain,
        release: vcaSettings.envelope2Release,
      },
    });

    // Update VCA2 volume
    if (vcaSettings.vca2Volume !== undefined) {
      vca2.volume.value = vcaSettings.vca2Volume;
    }
  }, [synth2, vca2, vcaSettings]);

  // Update filter parameters when filter settings change
  useEffect(() => {
    filter.set({
      type: filterSettings.type,
      frequency: filterSettings.frequency,
      Q: filterSettings.Q,
    });
  }, [filter, filterSettings]);

  // Connect both synthesizers through their VCAs to the filter and output
  useEffect(() => {
    // Create signal path for each synth
    synth1.chain(vca1, filter, analyser, Tone.Destination);
    synth2.chain(vca2, filter, analyser, Tone.Destination);

    // Cleanup function to dispose of audio nodes when component unmounts
    return () => {
      synth1.disconnect();
      synth2.disconnect();
      vca1.disconnect();
      vca2.disconnect();
      filter.disconnect();
      analyser.disconnect();
    };
  }, [synth1, synth2, vca1, vca2, filter, analyser]);

  const contextValue: AudioEngineContextProps = {
    synth1,
    synth2,
    vca1,
    vca2,
    filter,
    analyser,
  };

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
