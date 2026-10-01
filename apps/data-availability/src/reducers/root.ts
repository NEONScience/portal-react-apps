import { combineReducers, Reducer } from '@reduxjs/toolkit';
import { appReducer } from './app';

const rootReducer: Reducer = combineReducers({
  app: appReducer,
});

const RootReducer = {
  rootReducer,
};

export default RootReducer;
