
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { createLogger } from 'redux-logger';

import productReducer from './reducer/product';
import cartReducer from './reducer/cart';
import userReducer from './reducer/user';

const reducer = combineReducers({
  products: productReducer,
  cart: cartReducer,
  user: userReducer,
});

const preloadedState = {
  cart: { items: [] },
  products: { products: [] },
  user: { email: '', _id: '', name: '' },
};

const logger = createLogger();

const store = configureStore({
  reducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(logger),
  devTools: true,
  preloadedState,
});

export default store;
