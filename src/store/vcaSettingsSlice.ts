import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { EnvelopeDestination } from '../components/Envelope/Envelope';
import { ModulationType, OscillatorType } from '../synth/types';

interface VCASettingsState {
  oscillator1Type: OscillatorType;
  isFat1: boolean;
  detune1: number;
  envelope1Attack: number;
  envelope1Decay: number;
  envelope1Sustain: number;
  envelope1Release: number;
  vca1Volume: number; // VCA1 volume in dB
  semitone1: number; // Semitone shift for oscillator 1 (-24 to +24)
  spread1: number; // Spread for fat oscillators (0-100)
  pulseWidth1: number; // Pulse width for pulse/pwm oscillator types (0-1)
  phase1: number; // Phase offset (0-360 degrees)

  oscillator2Type: OscillatorType;
  isFat2: boolean;
  detune2: number;
  envelope2Attack: number;
  envelope2Decay: number;
  envelope2Sustain: number;
  envelope2Release: number;
  vca2Volume: number; // VCA2 volume in dB
  semitone2: number; // Semitone shift for oscillator 2 (-24 to +24)
  spread2: number; // Spread for fat oscillators (0-100)
  pulseWidth2: number; // Pulse width for pulse/pwm oscillator types (0-1)
  phase2: number; // Phase offset (0-360 degrees)
  envelope2Destination: EnvelopeDestination;

  modulationType: ModulationType;
  modulationAmount: number;
}

const initialState: VCASettingsState = {
  oscillator1Type: 'sawtooth',
  isFat1: false,
  detune1: 0,
  envelope1Attack: 0.01,
  envelope1Decay: 0.2,
  envelope1Sustain: 0.5,
  envelope1Release: 1,
  vca1Volume: -12,
  semitone1: 0,
  spread1: 20,
  pulseWidth1: 0.5,
  phase1: 0,

  oscillator2Type: 'square',
  isFat2: false,
  detune2: 0,
  envelope2Attack: 0.01,
  envelope2Decay: 0.2,
  envelope2Sustain: 0.5,
  envelope2Release: 1,
  envelope2Destination: 'filter',
  vca2Volume: -12,
  semitone2: 0,
  spread2: 20,
  pulseWidth2: 0.5,
  phase2: 0,

  modulationType: 'none',
  modulationAmount: 0,
};

const vcaSettingsSlice = createSlice({
  name: 'vcaSettings',
  initialState,
  reducers: {
    updateVCASettings: (
      state,
      action: PayloadAction<Partial<VCASettingsState>>
    ) => {
      return { ...state, ...action.payload };
    },
    resetVCASettings: () => {
      return initialState;
    },
  },
});

export const { updateVCASettings, resetVCASettings } = vcaSettingsSlice.actions;
export default vcaSettingsSlice.reducer;
