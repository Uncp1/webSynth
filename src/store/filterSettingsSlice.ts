import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface FilterSettings {
  type: BiquadFilterType;
  frequency: number;
  Q: number;
  envelopeAmount: number;
}
const initialState: FilterSettings = {
  type: 'lowpass',
  frequency: 7000,
  Q: 1,
  envelopeAmount: 50, // Default envelope modulation amount (0-100%)
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
