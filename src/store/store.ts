import { configureStore } from '@reduxjs/toolkit';
import filterSettingsReducer from './filterSettingsSlice';
import vcaSettingsReducer from './vcaSettingsSlice';

export const store = configureStore({
  reducer: {
    filterSettings: filterSettingsReducer,
    vcaSettings: vcaSettingsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
