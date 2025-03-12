import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import * as Tone from 'tone';

export interface SynthSettings {
  //oscillatorType: Tone.ToneOscillatorType;
  envelopeAttack: number;
  envelopeDecay: number;
  envelopeSustain: number;
  envelopeRelease: number;
}

const initialState: SynthSettings = {
  //oscillatorType: 'sine',
  envelopeAttack: 0.1,
  envelopeDecay: 0.2,
  envelopeSustain: 0.5,
  envelopeRelease: 1.0,
};

const synthSettingsSlice = createSlice({
  name: 'synthSettings',
  initialState,
  reducers: {
    updateSynthSettings: (
      state,
      action: PayloadAction<Partial<SynthSettings>>
    ) => {
      return { ...state, ...action.payload };
    },
  },
});

export const { updateSynthSettings } = synthSettingsSlice.actions;
export default synthSettingsSlice.reducer;
