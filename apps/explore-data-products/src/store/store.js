import {
	createStore,
	applyMiddleware
} from "redux";

import NeonEnvironment from 'portal-core-components/lib/components/NeonEnvironment';

import { getState } from "../store/state";
import reducer from "../reducers/reducer";
import { getEpicMiddleware, getCombinedEpics } from "../epics/root";

export const configureInitialStore = (neonContextData = null) => {
  return configureStore(getState(neonContextData));
}

export const configureStore = (state) => {
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
		state,
		applyMiddleware(...middlewares)
  );

  epicMiddleware.run(getCombinedEpics());

  return store;
}
