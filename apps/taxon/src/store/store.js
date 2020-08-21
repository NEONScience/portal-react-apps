import {
  createStore,
  applyMiddleware
} from "redux";
//import thunk from "redux-thunk";

import dataApp from "../reducers/reducer";
import { isDevEnv } from "../api/environment";
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
if (isDevEnv()) {
  const { logger } = require("redux-logger");
  middlewares.push(logger);
}

let store = createStore(
  dataApp,
  dataStore,
  applyMiddleware(...middlewares)
);

export { store };
