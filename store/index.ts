import { configureStore } from '@reduxjs/toolkit';
import productReducer from './product-slice';
import authReducer from './auth-slice';

export const store = configureStore({
  reducer: {
    products: productReducer,
    auth: authReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
