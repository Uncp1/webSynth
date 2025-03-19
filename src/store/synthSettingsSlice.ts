import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import * as Tone from 'tone';

export interface SynthSettings {
  oscillatorType: 'sine' | 'square' | 'triangle' | 'sawtooth';
  envelopeAttack: number;
  envelopeDecay: number;
  envelopeSustain: number;
  envelopeRelease: number;
  detune: number;
  // Новые поля для модулятора:
  modulatorOscillatorType: 'sine' | 'square' | 'triangle' | 'sawtooth';
  modulationEnvelopeAttack: number;
  modulationEnvelopeDecay: number;
  modulationEnvelopeSustain: number;
  modulationEnvelopeRelease: number;
}

const initialState: SynthSettings = {
  oscillatorType: 'sawtooth',
  envelopeAttack: 0.1,
  envelopeDecay: 0.2,
  envelopeSustain: 0.5,
  envelopeRelease: 1.0,
  detune: 0,
  // Значения по умолчанию для модулятора:
  modulatorOscillatorType: 'sine',
  modulationEnvelopeAttack: 0.1,
  modulationEnvelopeDecay: 0.2,
  modulationEnvelopeSustain: 0.5,
  modulationEnvelopeRelease: 1.0,
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
