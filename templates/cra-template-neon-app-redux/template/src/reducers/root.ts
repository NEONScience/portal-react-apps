import { combineReducers, Reducer } from 'redux';
import { appReducer } from './app';

const rootReducer: Reducer = combineReducers({
  app: appReducer,
});

const RootReducer = {
  rootReducer,
};

export default RootReducer;
