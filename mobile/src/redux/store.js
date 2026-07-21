import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';

import rootPersistConfig from './persistConfig';
import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';
import catalogReducer from './slices/catalogSlice';
import cartReducer from './slices/cartSlice';
import ordersReducer from './slices/ordersSlice';
import billsReducer from './slices/billsSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  ui: uiReducer,
  catalog: catalogReducer,
  cart: cartReducer,
  orders: ordersReducer,
  bills: billsReducer,
});

const persistedReducer = persistReducer(rootPersistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);
