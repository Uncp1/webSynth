import { configureStore } from '@reduxjs/toolkit';
import filterSettingsReducer from './filterSettingsSlice';
import synthSettingsReducer from './synthSettingsSlice';

export const store = configureStore({
  reducer: {
    filterSettings: filterSettingsReducer,
    synthSettings: synthSettingsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
