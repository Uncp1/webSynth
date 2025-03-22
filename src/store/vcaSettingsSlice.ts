import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define oscillator type
type OscillatorType =
  | 'sine'
  | 'square'
  | 'triangle'
  | 'sawtooth'
  | 'fatsawtooth'
  | 'fattriangle'
  | 'fatsquare';

// Define the state interface for VCA settings
interface VCASettingsState {
  // VCA 1 parameters
  oscillator1Type: OscillatorType;
  detune1: number;
  envelope1Attack: number;
  envelope1Decay: number;
  envelope1Sustain: number;
  envelope1Release: number;
  vca1Volume: number; // VCA1 volume in dB

  // VCA 2 parameters
  oscillator2Type: OscillatorType;
  detune2: number;
  envelope2Attack: number;
  envelope2Decay: number;
  envelope2Sustain: number;
  envelope2Release: number;
  vca2Volume: number; // VCA2 volume in dB
}

// Initial state with default values
const initialState: VCASettingsState = {
  // VCA 1 defaults
  oscillator1Type: 'sawtooth',
  detune1: 0,
  envelope1Attack: 0.01,
  envelope1Decay: 0.2,
  envelope1Sustain: 0.5,
  envelope1Release: 1,
  vca1Volume: -12, // 0dB = unity gain

  // VCA 2 defaults
  oscillator2Type: 'square',
  detune2: 0,
  envelope2Attack: 0.01,
  envelope2Decay: 0.2,
  envelope2Sustain: 0.5,
  envelope2Release: 1,
  vca2Volume: -12, // 0dB = unity gain
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
