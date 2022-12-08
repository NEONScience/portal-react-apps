import {
  createStore,
  applyMiddleware,
  AnyAction,
  Store,
  Middleware,
} from 'redux';
import { EpicMiddleware } from 'redux-observable';

import NeonEnvironment from 'portal-core-components/lib/components/NeonEnvironment';

import AppState from './appState';
import RootReducer from '../reducers/root';
import { getEpicMiddleware, getCombinedEpics } from '../epics/root';
import { StoreRootState } from '../types/store';

let store: Store<StoreRootState, AnyAction>;

const getStore = (): Store<StoreRootState, AnyAction> => (store);

const getRootState = (): StoreRootState => ({
  app: AppState.getAppState(),
});

const configureInitialStore = (): Store<StoreRootState, AnyAction> => (
  configureStore(getRootState())
);

const configureStore = (state: StoreRootState): Store<StoreRootState, AnyAction> => {
  const epicMiddleware: EpicMiddleware<AnyAction> = getEpicMiddleware();
  const middlewares: Middleware[] = [
    epicMiddleware,
  ];
  if (NeonEnvironment.isDevEnv) {
    const { logger } = require('redux-logger'); // eslint-disable-line
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    middlewares.push(logger);
  }
  store = createStore<StoreRootState, AnyAction, Record<string, unknown>, Record<string, unknown>>(
    RootReducer.rootReducer,
    state,
    applyMiddleware(...middlewares),
  );
  epicMiddleware.run(getCombinedEpics() as never);
  return store;
};

const RootStore = {
  getStore,
  getRootState,
  configureInitialStore,
  configureStore,
};

export default RootStore;
