import {
  createStore,
  applyMiddleware
} from "redux";

import NeonEnvironment from 'portal-core-components/lib/components/NeonEnvironment';

import reducer from "../reducers/reducer";
import { getState } from "../store/state";
import { getEpicMiddleware, getCombinedEpics } from "../epics/root";

export const configureStore = () => {
  let epicMiddleware = getEpicMiddleware();
  let middlewares = [
    epicMiddleware
  ];
  if (NeonEnvironment.isDevEnv) {
    const { logger } = require("redux-logger");
    middlewares.push(logger);
  }

  let store = createStore(
    reducer,
    getState(),
    applyMiddleware(...middlewares)
  );

  epicMiddleware.run(getCombinedEpics());

  return store;
}
