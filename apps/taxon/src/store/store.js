import {
  createStore,
  applyMiddleware
} from "redux";
//import thunk from "redux-thunk";

import NeonEnvironment from 'portal-core-components/lib/components/NeonEnvironment';

import dataApp from "../reducers/reducer";
import { getTaxonApiPath } from "../api/taxon";
import { DEFAULT_TAXON_TYPE } from "../api/taxonTypes";
import { getColumns } from "../api/dataTableColumns";

let dataStore = {
  taxonTypes: [],
  locations: [],
  taxonColumns: getColumns(),
  columnManagerVisible: false,
  taxonQuery: {
    rootApiUrl: getTaxonApiPath(),
    taxonTypeCode: DEFAULT_TAXON_TYPE,
    locationName: null
  }
};

//let middlewares = [ thunk ];
let middlewares = [];
if (NeonEnvironment.isDevEnv) {
  const { logger } = require("redux-logger");
  middlewares.push(logger);
}

let store = createStore(
  dataApp,
  dataStore,
  applyMiddleware(...middlewares)
);

export { store };
