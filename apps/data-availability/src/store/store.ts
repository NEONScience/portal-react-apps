import { configureStore as configureReduxStore } from '@reduxjs/toolkit';
import {
  UnknownAction,
  Store,
} from 'redux';
import { EpicMiddleware } from 'redux-observable';

import NeonEnvironment from '@neonscience/portal-core-components/components/NeonEnvironment';
import { EpicDependencies } from '@neonscience/portal-core-components/types/epic';

import AppState from './appState';
import RootReducer from '../reducers/root';
import { getEpicMiddleware, getCombinedEpics } from '../epics/root';
import { StoreRootState } from '../types/store';

let store: Store<StoreRootState, UnknownAction>;

const getStore = (): Store<StoreRootState, UnknownAction> => (store);

const getRootState = (): StoreRootState => ({
  app: AppState.getAppState(),
});

const configureStore = (state: StoreRootState): Store<StoreRootState, UnknownAction> => {
  const epicMiddleware: EpicMiddleware<
    UnknownAction,
    UnknownAction,
    StoreRootState,
    EpicDependencies
  > = getEpicMiddleware();
  store = configureReduxStore({
    reducer: RootReducer.rootReducer,
    preloadedState: state,
    middleware: (getDefaultMiddleware) => {
      const middleware = getDefaultMiddleware({
        thunk: false,
        serializableCheck: false,
      }).concat(epicMiddleware);
      if (NeonEnvironment.isDevEnv) {
        // eslint-disable-next-line global-require, @typescript-eslint/no-require-imports
        const { logger } = require('redux-logger');
        return middleware.concat(logger);
      }
      return middleware;
    },
  });
  epicMiddleware.run(getCombinedEpics() as never);
  return store;
};

const configureInitialStore = (): Store<StoreRootState, UnknownAction> => (
  configureStore(getRootState())
);

const RootStore = {
  getStore,
  getRootState,
  configureInitialStore,
  configureStore,
};

export default RootStore;
