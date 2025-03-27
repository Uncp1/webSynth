import React, {
  createContext,
  useContext,
  useMemo,
  useEffect,
  useRef,
} from 'react';
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
  filterEnvelope: Tone.Envelope;
}

const AudioEngineContext = createContext<AudioEngineContextProps | null>(null);

export const AudioEngineProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const vcaSettings = useSelector((state: RootState) => state.vcaSettings);
  const filterSettings = useSelector(
    (state: RootState) => state.filterSettings
  );

  // Create a reference to track current active notes for the filter envelope
  const activeNotesRef = useRef<Set<string>>(new Set());

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

  // Create a separate envelope for filter modulation
  const filterEnvelope = useMemo(
    () =>
      new Tone.Envelope({
        attack: vcaSettings.envelope2Attack || 0.01,
        decay: vcaSettings.envelope2Decay || 0.2,
        sustain: vcaSettings.envelope2Sustain || 0.5,
        release: vcaSettings.envelope2Release || 1,
      }),
    []
  );

  // Create filter
  const filter = useMemo(
    () =>
      new Tone.Filter({
        type: filterSettings.type || 'lowpass',
        frequency: filterSettings.frequency || 1000,
        Q: filterSettings.Q || 1,
      }),
    []
  );

  // Create analyzer for the oscilloscope
  const analyser = useMemo(() => new Tone.Analyser('waveform', 2048), []);

  // Create scale node for envelope amount control
  const filterEnvScaler = useMemo(() => new Tone.Gain(0), []);

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
    });

    // Update envelope settings based on destination
    if (vcaSettings.envelope2Destination === 'vca2') {
      // If the envelope is connected to VCA, update the synth2 envelope
      synth2.set({
        envelope: {
          attack: vcaSettings.envelope2Attack,
          decay: vcaSettings.envelope2Decay,
          sustain: vcaSettings.envelope2Sustain,
          release: vcaSettings.envelope2Release,
        },
      });
    }

    // Always update the filter envelope with envelope2 settings
    // (it will only be used when envelope2Destination is 'filter')
    filterEnvelope.attack = vcaSettings.envelope2Attack;
    filterEnvelope.decay = vcaSettings.envelope2Decay;
    filterEnvelope.sustain = vcaSettings.envelope2Sustain;
    filterEnvelope.release = vcaSettings.envelope2Release;

    // Update VCA2 volume
    if (vcaSettings.vca2Volume !== undefined) {
      vca2.volume.value = vcaSettings.vca2Volume;
    }
  }, [synth2, vca2, filterEnvelope, vcaSettings]);

  // Update filter parameters when filter settings change
  useEffect(() => {
    filter.set({
      type: filterSettings.type || 'lowpass',
      frequency: filterSettings.frequency,
      Q: filterSettings.Q,
    });

    // Update filter envelope modulation amount
    // Scale from -100 to 100 to a reasonable frequency range
    if (filterSettings.envelopeAmount !== undefined) {
      // Calculate modulation range in Hz (positive or negative)
      // For example, a value of 100 could allow modulation up to 10000Hz from the base frequency
      const modAmount = (filterSettings.envelopeAmount / 100) * 10000;
      filterEnvScaler.gain.value = modAmount;
    }
  }, [filter, filterEnvScaler, filterSettings]);

  // Handle envelope destination changes and connections
  useEffect(() => {
    // First, disconnect any existing connections to start fresh
    filterEnvelope.disconnect();
    filterEnvScaler.disconnect();

    // Connect filterEnvelope to the scaler if destination is 'filter'
    if (vcaSettings.envelope2Destination === 'filter') {
      // Connect the envelope to the frequency parameter of the filter through a scaler
      filterEnvelope.connect(filterEnvScaler);
      filterEnvScaler.connect(filter.frequency);

      // When destination is filter, we need to use a static envelope for synth2
      // (not modulated by notes)
      synth2.set({
        envelope: {
          attack: 0.01, // Quick attack for immediate sound
          decay: 0.2,
          sustain: 0.8, // High sustain for consistent volume
          release: 0.5,
        },
      });
    } else {
      // When destination is VCA (default), restore envelope settings to synth2
      synth2.set({
        envelope: {
          attack: vcaSettings.envelope2Attack,
          decay: vcaSettings.envelope2Decay,
          sustain: vcaSettings.envelope2Sustain,
          release: vcaSettings.envelope2Release,
        },
      });
    }
  }, [
    filterEnvelope,
    filterEnvScaler,
    synth2,
    filter.frequency,
    vcaSettings.envelope2Destination,
    vcaSettings.envelope2Attack,
    vcaSettings.envelope2Decay,
    vcaSettings.envelope2Sustain,
    vcaSettings.envelope2Release,
  ]);

  // Override synth1 and synth2 triggerAttack and triggerRelease to also trigger the filter envelope
  useEffect(() => {
    // Save the original methods
    const origSynth1TriggerAttack = synth1.triggerAttack.bind(synth1);
    const origSynth1TriggerRelease = synth1.triggerRelease.bind(synth1);
    const origSynth2TriggerAttack = synth2.triggerAttack.bind(synth2);
    const origSynth2TriggerRelease = synth2.triggerRelease.bind(synth2);

    // Override with our own implementations that also trigger the filter envelope
    synth1.triggerAttack = (notes, time, velocity) => {
      origSynth1TriggerAttack(notes, time, velocity);

      // If envelope 2 is routed to filter, trigger the filter envelope
      if (vcaSettings.envelope2Destination === 'filter') {
        // Convert notes to array if it's not already
        const noteArray = Array.isArray(notes) ? notes : [notes];

        // Track active notes
        noteArray.forEach((note) => activeNotesRef.current.add(note));

        // Only trigger if this is the first note (to prevent retrigger on polyphonic playing)
        if (activeNotesRef.current.size === noteArray.length) {
          filterEnvelope.triggerAttack(time);
        }
      }

      return synth1;
    };

    synth1.triggerRelease = (notes, time) => {
      origSynth1TriggerRelease(notes, time);

      // If envelope 2 is routed to filter, handle release
      if (vcaSettings.envelope2Destination === 'filter') {
        // Convert notes to array if it's not already
        const noteArray = Array.isArray(notes) ? notes : [notes];

        // Remove released notes from tracking
        noteArray.forEach((note) => activeNotesRef.current.delete(note));

        // Only release envelope if all notes are released
        if (activeNotesRef.current.size === 0) {
          filterEnvelope.triggerRelease(time);
        }
      }

      return synth1;
    };

    // Same for synth2
    synth2.triggerAttack = (notes, time, velocity) => {
      origSynth2TriggerAttack(notes, time, velocity);

      // Only handle if envelope 2 is routed to filter (for the second synth)
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

    // Cleanup function to restore original methods when component unmounts
    return () => {
      synth1.triggerAttack = origSynth1TriggerAttack;
      synth1.triggerRelease = origSynth1TriggerRelease;
      synth2.triggerAttack = origSynth2TriggerAttack;
      synth2.triggerRelease = origSynth2TriggerRelease;
    };
  }, [synth1, synth2, filterEnvelope, vcaSettings.envelope2Destination]);

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
      filterEnvelope.disconnect();
      filterEnvScaler.disconnect();
      analyser.disconnect();
    };
  }, [
    synth1,
    synth2,
    vca1,
    vca2,
    filter,
    filterEnvelope,
    filterEnvScaler,
    analyser,
  ]);

  const contextValue: AudioEngineContextProps = {
    synth1,
    synth2,
    vca1,
    vca2,
    filter,
    filterEnvelope,
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
