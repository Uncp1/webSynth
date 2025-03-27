import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { EnvelopeDestination } from '../components/Envelope/Envelope';

// Define oscillator type
type OscillatorType =
  | 'sine'
  | 'square'
  | 'triangle'
  | 'sawtooth'
  | 'pulse'
  | 'pwm'
  | 'custom';

// Define modulation type
type ModulationType = 'none' | 'hardsync' | 'ringmod' | 'fm';

// Define the state interface for VCA settings
interface VCASettingsState {
  // VCA 1 parameters
  oscillator1Type: OscillatorType;
  isFat1: boolean; // Toggle for fat mode
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

  // VCA 2 parameters
  oscillator2Type: OscillatorType;
  isFat2: boolean; // Toggle for fat mode
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

  // Modulation parameters
  modulationType: ModulationType; // Type of modulation
  modulationAmount: number; // Amount of modulation (0-100)
}

// Initial state with default values
const initialState: VCASettingsState = {
  // VCA 1 defaults
  oscillator1Type: 'sawtooth',
  isFat1: false, // Start with regular oscillator
  detune1: 0,
  envelope1Attack: 0.01,
  envelope1Decay: 0.2,
  envelope1Sustain: 0.5,
  envelope1Release: 1,
  vca1Volume: -12, // 0dB = unity gain
  semitone1: 0,
  spread1: 20, // Default spread when fat is enabled
  pulseWidth1: 0.5,
  phase1: 0,

  // VCA 2 defaults
  oscillator2Type: 'square',
  isFat2: false, // Start with regular oscillator
  detune2: 0,
  envelope2Attack: 0.01,
  envelope2Decay: 0.2,
  envelope2Sustain: 0.5,
  envelope2Release: 1,
  envelope2Destination: 'filter',
  vca2Volume: -12, // 0dB = unity gain
  semitone2: 0,
  spread2: 20, // Default spread when fat is enabled
  pulseWidth2: 0.5,
  phase2: 0,

  // Modulation defaults
  modulationType: 'none',
  modulationAmount: 0,
};

// Create the slice
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

// Export actions and reducer
export const { updateVCASettings, resetVCASettings } = vcaSettingsSlice.actions;
export default vcaSettingsSlice.reducer;
