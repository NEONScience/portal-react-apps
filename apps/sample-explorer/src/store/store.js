import {
  createStore,
  applyMiddleware
} from "redux";
import thunk from "redux-thunk";

import NeonEnvironment from 'portal-core-components/lib/components/NeonEnvironment';

import dataApp from "../reducers/reducers";
import { QUERY_TYPE, getQueryTypeNameOptions } from "../util/queryUtil";

let dataStore = {
  urlParams: {
    parsed: false,
    fetch: false,
    idType: null,
    sampleTag: null,
    sampleClass: null,
    archiveGuid: null,
    barcode: null,
  },
  query: {
    queryType: QUERY_TYPE.SAMPLE_TAG,
    queryTypeOptions: getQueryTypeNameOptions(),
    queryErrorStr: null,
    queryIsLoading: false,
    sampleTag: null,
    sampleClass: null,
    archiveGuid: null,
    barcode: null,
    sampleClasses: [],
  },
  search: {
    sampleTag: null,
    sampleClass: null,
    archiveGuid: null,
    barcode: null,
  },
  downloadIsLoading: false,
  downloadErrorStr: null,
  dataProducts: [],
  parentUuids: [],
  childUuids: [],
  sampleEvents: [],
  sampleUuid: "",
  previousSampleUuid: "",
  uuidBreadcrumbs: [],
  visitedSamples: {
    sampleUuids: [],
    sampleViews: [],
  },
  originalUuid: "",
  graphData: {
    nodes: [],
    links: [],
  },
  initialColumns: [
    { headerName: "table", field: "table", sortable: true, resizable: true, filter: true },
    {
      headerName: "fate date",
      field: "fate_date",
      filter: true,
      sortable: true,
      resizable: true,
      sort: "asc",
      sortingOrder: ["asc", "desc"]
    },
    { headerName: "fate", field: "fate", sortable: true, resizable: true, filter: true },
    { headerName: "fate location", field: "fate_location", sortable: true, resizable: true, filter: true },
  ],
  tableDefinition: [],
  tableData: [],
  cacheControl: "",
  sampleClassDesc: new Map(),
};

export const configureInitialStore = () => {
  return configureStore(dataStore);
}

export const configureStore = (state) => {
  let middlewares = [
    thunk
  ];
  if (NeonEnvironment.isDevEnv) {
    const { logger } = require("redux-logger");
    middlewares.push(logger);
  }

  let store = createStore(
    dataApp,
    state,
    applyMiddleware(...middlewares)
  );

  return store;
}
