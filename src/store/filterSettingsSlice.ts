import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface FilterSettings {
  type: BiquadFilterType;
  frequency: number;
  Q: number;
  envelopeAmount: number;

  distortionEnabled: boolean;
  distortionAmount: number;
  distortionType: 'soft' | 'hard' | 'fuzz';
}
const initialState: FilterSettings = {
  type: 'lowpass',
  frequency: 7000,
  Q: 1,
  envelopeAmount: 50, // (0-100%)

  distortionEnabled: false,
  distortionAmount: 0.3, // 0-1
  distortionType: 'soft',
};

const filterSettingsSlice = createSlice({
  name: 'filterSettings',
  initialState,
  reducers: {
    updateFilterSettings: (
      state,
      action: PayloadAction<Partial<FilterSettings>>
    ) => {
      return { ...state, ...action.payload };
    },
  },
});

export const { updateFilterSettings } = filterSettingsSlice.actions;
export default filterSettingsSlice.reducer;
