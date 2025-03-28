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
import { getOscillatorType } from './utils';

interface AudioEngineContextProps {
  synth1: Tone.PolySynth<Tone.Synth>;
  synth2: Tone.PolySynth<Tone.Synth>;
  filter: Tone.Filter;
  vca1: Tone.Volume;
  vca2: Tone.Volume;
  analyser: Tone.Analyser;
  filterEnvelope: Tone.Envelope;
  distortion: Tone.Distortion; // Added distortion node
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

  // Reference for modulation nodes
  const modulationNodeRef = useRef<Tone.ToneAudioNode | null>(null);

  // Create two polyphonic synthesizers
  const synth1 = useMemo(
    () =>
      new Tone.PolySynth(Tone.Synth, {
        oscillator: {
          type: getOscillatorType(
            vcaSettings.oscillator1Type,
            vcaSettings.isFat1
          ),
          // Remove the count property as it's not supported
          spread: 0,
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
          type: getOscillatorType(
            vcaSettings.oscillator2Type,
            vcaSettings.isFat2
          ),
          // Remove the count property as it's not supported
          spread: 0,
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

  // Create distortion node
  const distortion = useMemo(
    () =>
      new Tone.Distortion({
        distortion: filterSettings.distortionAmount || 0.3,
        wet: filterSettings.distortionEnabled ? 1 : 0,
      }),
    []
  );

  // Create analyzer for the oscilloscope
  const analyser = useMemo(() => new Tone.Analyser('waveform', 2048), []);

  // Create scale node for envelope amount control
  const filterEnvScaler = useMemo(() => new Tone.Gain(0), []);

  // Update oscillator settings
  useEffect(() => {
    // Update oscillator 1 settings
    synth1.set({
      oscillator: {
        type: getOscillatorType(
          vcaSettings.oscillator1Type,
          vcaSettings.isFat1
        ),
        // Remove count property, use spread only for fat
        spread: vcaSettings.isFat1 ? vcaSettings.spread1 : 0,
        width:
          vcaSettings.oscillator1Type === 'pulse' ||
          vcaSettings.oscillator1Type === 'pwm'
            ? vcaSettings.pulseWidth1
            : undefined,
        phase: vcaSettings.phase1,
      },
    });

    // Update oscillator 2 settings
    synth2.set({
      oscillator: {
        type: getOscillatorType(
          vcaSettings.oscillator2Type,
          vcaSettings.isFat2
        ),
        // Remove count property, use spread only for fat
        spread: vcaSettings.isFat2 ? vcaSettings.spread2 : 0,
        width:
          vcaSettings.oscillator2Type === 'pulse' ||
          vcaSettings.oscillator2Type === 'pwm'
            ? vcaSettings.pulseWidth2
            : undefined,
        phase: vcaSettings.phase2,
      },
    });
  }, [
    synth1,
    synth2,
    vcaSettings.oscillator1Type,
    vcaSettings.oscillator2Type,
    vcaSettings.isFat1,
    vcaSettings.isFat2,
    vcaSettings.pulseWidth1,
    vcaSettings.pulseWidth2,
    vcaSettings.phase1,
    vcaSettings.phase2,
    vcaSettings.spread1,
    vcaSettings.spread2,
  ]);

  // Update synthesizer base frequency for semitone shifting
  useEffect(() => {
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
    if (filterSettings.envelopeAmount !== undefined) {
      const modAmount = (filterSettings.envelopeAmount / 100) * 10000;
      filterEnvScaler.gain.value = modAmount;
    }
  }, [filter, filterEnvScaler, filterSettings]);

  // Update distortion settings when they change
  useEffect(() => {
    // Update distortion amount
    distortion.distortion = filterSettings.distortionAmount;

    // Update distortion wet value (0 = off, 1 = on)
    distortion.wet.value = filterSettings.distortionEnabled ? 1 : 0;

    // Apply different distortion curves based on distortion type
    if (filterSettings.distortionType === 'soft') {
      // Default soft clipping
      // No change needed as Tone.Distortion uses tanh by default
    } else if (filterSettings.distortionType === 'hard') {
      // Hard clipping curve
      const samples = 8192;
      const curve = new Float32Array(samples);
      const threshold = 0.5;

      for (let i = 0; i < samples; ++i) {
        const x = (i * 2) / samples - 1;
        curve[i] = x === 0 ? 0 : Math.max(Math.min(x, threshold), -threshold);
      }

      distortion.curve = curve;
    } else if (filterSettings.distortionType === 'fuzz') {
      // Fuzz-style distortion with more aggressive curve
      const samples = 8192;
      const curve = new Float32Array(samples);

      for (let i = 0; i < samples; ++i) {
        const x = (i * 2) / samples - 1;
        // Aggressive fuzz-style transfer function
        curve[i] = Math.tanh(Math.pow(Math.abs(x), 0.3) * 8 * Math.sign(x));
      }

      distortion.curve = curve;
    }
  }, [
    distortion,
    filterSettings.distortionAmount,
    filterSettings.distortionEnabled,
    filterSettings.distortionType,
  ]);

  // Handle envelope destination changes and connections
  useEffect(() => {
    // First, disconnect any existing connections to start fresh
    try {
      filterEnvelope.disconnect();
      filterEnvScaler.disconnect();
    } catch {
      // Ignore errors if not connected
    }

    // Connect filterEnvelope to the scaler if destination is 'filter'
    if (vcaSettings.envelope2Destination === 'filter') {
      // Connect the envelope to the frequency parameter of the filter through a scaler
      filterEnvelope.connect(filterEnvScaler);
      // Use connect(param) method instead of directly assigning frequency
      filterEnvScaler.connect(filter.frequency);

      // When destination is filter, use a static envelope for synth2
      synth2.set({
        envelope: {
          attack: 0.01,
          decay: 0.2,
          sustain: 0.8,
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

  // Override synth1 and synth2 triggerAttack and triggerRelease
  useEffect(() => {
    // Save the original methods
    const origSynth1TriggerAttack = synth1.triggerAttack.bind(synth1);
    const origSynth1TriggerRelease = synth1.triggerRelease.bind(synth1);
    const origSynth2TriggerAttack = synth2.triggerAttack.bind(synth2);
    const origSynth2TriggerRelease = synth2.triggerRelease.bind(synth2);

    // Override for filter envelope handling
    synth1.triggerAttack = (notes, time, velocity) => {
      origSynth1TriggerAttack(notes, time, velocity);

      if (vcaSettings.envelope2Destination === 'filter') {
        const noteArray = Array.isArray(notes) ? notes : [notes];

        noteArray.forEach((note) => activeNotesRef.current.add(note));

        if (activeNotesRef.current.size === noteArray.length) {
          filterEnvelope.triggerAttack(time);
        }
      }

      return synth1;
    };

    synth1.triggerRelease = (notes, time) => {
      origSynth1TriggerRelease(notes, time);

      if (vcaSettings.envelope2Destination === 'filter') {
        const noteArray = Array.isArray(notes) ? notes : [notes];

        noteArray.forEach((note) => activeNotesRef.current.delete(note));

        if (activeNotesRef.current.size === 0) {
          filterEnvelope.triggerRelease(time);
        }
      }

      return synth1;
    };

    // Same for synth2
    synth2.triggerAttack = (notes, time, velocity) => {
      origSynth2TriggerAttack(notes, time, velocity);

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

    return () => {
      synth1.triggerAttack = origSynth1TriggerAttack;
      synth1.triggerRelease = origSynth1TriggerRelease;
      synth2.triggerAttack = origSynth2TriggerAttack;
      synth2.triggerRelease = origSynth2TriggerRelease;
    };
  }, [synth1, synth2, filterEnvelope, vcaSettings.envelope2Destination]);

  // CRITICAL PART: Setup all connections (including modulation) in one place
  useEffect(() => {
    // Disconnect everything first to avoid duplicate connections
    try {
      synth1.disconnect();
      synth2.disconnect();
      vca1.disconnect();
      vca2.disconnect();
      filter.disconnect();
      distortion.disconnect();

      if (modulationNodeRef.current) {
        modulationNodeRef.current.disconnect();
        modulationNodeRef.current = null;
      }
    } catch {
      console.warn('Error disconnecting nodes');
    }

    // Simple routing without modulation for now
    synth1.connect(vca1);
    synth2.connect(vca2);

    // Now connect VCAs to filter, filter to distortion, distortion to analyzer, analyzer to destination
    vca1.connect(filter);
    vca2.connect(filter);
    filter.connect(distortion);
    distortion.connect(analyser);
    analyser.connect(Tone.Destination);

    return () => {
      // Cleanup function
      synth1.disconnect();
      synth2.disconnect();
      vca1.disconnect();
      vca2.disconnect();
      filter.disconnect();
      distortion.disconnect();
      analyser.disconnect();
      if (modulationNodeRef.current) {
        modulationNodeRef.current.disconnect();
      }
    };
  }, [
    synth1,
    synth2,
    vca1,
    vca2,
    filter,
    distortion,
    analyser,
    vcaSettings.modulationType,
  ]);

  const contextValue: AudioEngineContextProps = {
    synth1,
    synth2,
    vca1,
    vca2,
    filter,
    filterEnvelope,
    analyser,
    distortion, // Export distortion in the context
  };

  return (
    <AudioEngineContext.Provider value={contextValue}>
      {children}
    </AudioEngineContext.Provider>
  );
};

// Moving this function outside the component to help with fast refresh
export const useAudioEngine = () => {
  const context = useContext(AudioEngineContext);
  if (!context) {
    throw new Error(
      'useAudioEngine must be used within an AudioEngineProvider'
    );
  }
  return context;
};
