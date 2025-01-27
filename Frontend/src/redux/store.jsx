import { configureStore } from '@reduxjs/toolkit';
import albumReducer from './slices/albumSlice';
import availableReducer from './slices/availableSlice';
import tradedReducer from './slices/tradedSlice';

export const store = configureStore({
  reducer: {
    album: albumReducer,
    available: availableReducer,
    traded: tradedReducer,
  },
});
