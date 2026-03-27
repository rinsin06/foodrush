import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authReducer from './slices/authSlice.js';
import cartReducer from './slices/cartSlice.js';
import restaurantReducer from './slices/restaurantSlice.js';
import orderReducer from './slices/orderSlice.js';
import uiReducer from './slices/uiSlice.js';
import chatbotReducer from './slices/chatbotSlice.js';
import paymentReducer from './slices/paymentSlice.js';
import locationReducer from './slices/locationSlice';
import addressReducer from './slices/addressSlice';

const authPersistConfig = { key: 'auth', storage, whitelist: ['user', 'accessToken', 'refreshToken'] };
const cartPersistConfig = { key: 'cart', storage, whitelist: ['items', 'restaurantId', 'restaurantName', 'couponCode', 'couponDiscount'] };
const uiPersistConfig = { key: 'ui', storage, whitelist: ['darkMode'] };

export const store = configureStore({
  reducer: {
    auth: persistReducer(authPersistConfig, authReducer),
    cart: persistReducer(cartPersistConfig, cartReducer),
    ui: persistReducer(uiPersistConfig, uiReducer),
    restaurant: restaurantReducer,
    order: orderReducer,
    payment: paymentReducer,
    location: locationReducer,
    addresses: addressReducer,
    chatbot: chatbotReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: { ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER] },
    }),
  devTools: import.meta.env.DEV,
});

export const persistor = persistStore(store);
