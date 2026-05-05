import {
  createStore,
  applyMiddleware,
} from "redux";

import NeonEnvironment from 'portal-core-components/lib/components/NeonEnvironment';

import dataApp from "../reducers/reducer";
import { getTaxonApiPath } from "../api/taxon";
import { DEFAULT_TAXON_TYPE } from "../api/taxonTypes";
import { getColumns } from "../api/dataTableColumns";

const dataStore = {
  taxonTypes: [],
  locations: [],
  taxonColumns: getColumns(),
  columnManagerVisible: false,
  taxonQuery: {
    rootApiUrl: getTaxonApiPath(),
    taxonTypeCode: DEFAULT_TAXON_TYPE,
    locationName: null,
  },
};

const middlewares = [];
if (NeonEnvironment.isDevEnv) {
  // eslint-disable-next-line global-require
  const { logger } = require("redux-logger");
  middlewares.push(logger);
}

const store = createStore(
  dataApp,
  dataStore,
  applyMiddleware(...middlewares),
);

export default store;
