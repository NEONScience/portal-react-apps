/* eslint-disable import/no-unresolved, no-unused-vars */
import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
} from 'react';
import PropTypes from 'prop-types';

import { useHistory, useLocation } from 'react-router-dom';

import logger from 'use-reducer-logger';

import cloneDeep from 'lodash/cloneDeep';

import NeonApi from 'portal-core-components/lib/components/NeonApi';
import NeonContext from 'portal-core-components/lib/components/NeonContext';

import {
  /* constants */
  DEFAULT_SORT_METHOD,
  DEFAULT_SORT_DIRECTION,
  FILTER_KEYS,
  INITIAL_FILTER_ITEMS,
  INITIAL_FILTER_VALUES,
  /* functions */
  applySort,
  applyFilter,
  getUuidFromURL,
  parseAllDatasets,
  resetAllFilters,
  resetFilter,
} from './filterUtil';

const FETCH_STATUS = {
  AWAITING_CALL: 'AWAITING_CALL',
  FETCHING: 'FETCHING',
  ERROR: 'ERROR',
  SUCCESS: 'SUCCESS',
};

const APP_STATUS = {
  INITIALIZING: 'INITIALIZING',
  FETCHING: 'FETCHING',
  READY: 'READY',
  ERROR: 'ERROR',
};

/**
   STATE
*/
const DEFAULT_STATE = {
  app: {
    status: APP_STATUS.INITIALIZING,
    error: null,
  },

  datasetsFetch: {
    status: FETCH_STATUS.AWAITING_CALL,
    error: null,
  },

  route: {
    uuid: null,
    nextUuid: undefined,
  },

  neonContextState: cloneDeep(NeonContext.DEFAULT_STATE),

  // Objects indexed by dataset uuid. Items go to unparsed first and only get parsed when
  // NeonContext is fully loaded.
  unparsedDatasets: {},
  datasets: {},

  // Object used present the appropriately sorted subset of datasets based on user inputs
  currentDatasets: {
    // Sorted list of dataset uuids
    order: [],
    // Mapping by uuid to object containing filter+absolute booleans to track visibility
    visibility: {},
    // Mapping of uuid to a relevance number for current applied search terms
    searchRelevance: {},
  },

  // Stats about the entire dataset catalog independent of filters, derived once on load
  stats: {
    totalDatasets: 0,
    totalDateRange: [null, null],
  },

  // How many potentially visible products to actually show
  // increase with scroll; reset with filter change
  scrollCutoff: 10,

  sort: {
    method: DEFAULT_SORT_METHOD,
    direction: DEFAULT_SORT_DIRECTION,
  },

  // Store for all discrete options for filters that make use of them
  filterItems: cloneDeep(INITIAL_FILTER_ITEMS),
  // Store for current values applied for all filters
  filterValues: cloneDeep(INITIAL_FILTER_VALUES),
  // List of filter keys that have been applied / are not in a cleared state
  filtersApplied: [],
};

/**
   CONTEXT
*/
const Context = createContext(DEFAULT_STATE);

/**
   HOOK
*/
const usePrototypeContextState = () => {
  const hookResponse = useContext(Context);
  if (hookResponse.length !== 2) {
    return [cloneDeep(DEFAULT_STATE), () => {}];
  }
  return hookResponse;
};

const calculateAppStatus = (state) => {
  const { datasetsFetch: { status: datasetsFetchStatus } } = state;
  const newState = { ...state };
  if (datasetsFetchStatus === FETCH_STATUS.AWAITING_CALL) {
    newState.app.status = APP_STATUS.INITIALIZING;
    return newState;
  }
  if (datasetsFetchStatus === FETCH_STATUS.ERROR) {
    newState.app.status = APP_STATUS.ERROR;
    return newState;
  }
  if (datasetsFetchStatus === FETCH_STATUS.FETCHING || !state.neonContextState.isFinal) {
    newState.app.status = APP_STATUS.FETCHING;
    return newState;
  }
  newState.app.status = APP_STATUS.READY;
  return newState;
};

/**
   REDUCER
*/
const reducer = (state, action) => {
  let newState = { ...state };
  const errorDetail = (
    !action.error ? null
      : ((action.error.response || {}).error || {}).detail || action.error.message || null
  );

  switch (action.type) {
    // Initialization
    case 'reinitialize':
      return cloneDeep(DEFAULT_STATE);

    // Routing
    case 'setInitialRouteToUuid':
      newState.route.uuid = action.uuid || null;
      newState.route.nextUuid = undefined;
      return newState;
    case 'setNextUuid':
      newState.route.nextUuid = action.uuid;
      return newState;
    case 'applyNextUuid':
      newState.route.uuid = newState.route.nextUuid;
      newState.route.nextUuid = undefined;
      return newState;

    // General failure
    case 'error':
      newState.app.status = APP_STATUS.ERROR;
      newState.app.error = action.error;
      return newState;

    // Neon Context
    case 'storeFinalizedNeonContextState':
      newState = parseAllDatasets({ ...newState, neonContextState: action.neonContextState });
      return calculateAppStatus(newState);

    // Fetch datasets
    case 'fetchDatasetsStarted':
      newState.datasetsFetch.status = FETCH_STATUS.FETCHING;
      return calculateAppStatus(newState);
    case 'fetchDatasetsFailed':
      newState.datasetsFetch.status = FETCH_STATUS.ERROR;
      newState.datasetsFetch.error = action.error;
      newState.app.error = errorDetail;
      return calculateAppStatus(newState);
    case 'fetchDatasetsSucceeded':
      newState.datasetsFetch.status = FETCH_STATUS.SUCCESS;
      newState.unparsedDatasets = {};
      action.data.forEach((dataset) => {
        if (!dataset || typeof dataset !== 'object' || !dataset.uuid) { return; }
        newState.unparsedDatasets[dataset.uuid] = dataset;
      });
      return calculateAppStatus(parseAllDatasets(newState));

    // Sort
    case 'applySort':
      return applySort(state, action.method, action.direction);

    // Filter
    case 'resetFilter':
      return resetFilter(newState, action.filterKey);
    case 'resetAllFilters':
      return resetAllFilters(newState);
    case 'applyFilter':
      return applyFilter(state, action.filterKey, action.filterValue);

    // Scrolling
    case 'incrementScrollCutoff':
      return { ...state, scrollCutoff: state.scrollCutoff + 10 };

    // Default
    default:
      return state;
  }
};

/**
   PROVIDER
*/
const Provider = (props) => {
  const { children } = props;

  const initialState = cloneDeep(DEFAULT_STATE);
  const [state, dispatch] = useReducer(
    process.env.NODE_ENV === 'development' ? logger(reducer) : reducer,
    initialState,
  );

  const {
    app: { status: appStatus },
    datasetsFetch: { status: datasetsFetchStatus },
    route: { uuid: routeUuid, nextUuid: routeNextUuid },
  } = state;

  /**
     Effects
  */
  // Parse uuid out of the route (URL) and set the initial route if not null
  useEffect(() => {
    if (appStatus !== APP_STATUS.INITIALIZING) { return; }
    const uuid = getUuidFromURL();
    if (!uuid) { return; }
    dispatch({ type: 'setInitialRouteToUuid', uuid });
  }, [appStatus]);

  // Trigger initial prototype datasets fetch
  useEffect(() => {
    if (
      appStatus !== APP_STATUS.INITIALIZING
        || datasetsFetchStatus !== FETCH_STATUS.AWAITING_CALL
    ) { return; }
    NeonApi.getPrototypeDatasetsObservable().subscribe(
      (response) => {
        dispatch({ type: 'fetchDatasetsSucceeded', data: response.data });
      },
      (error) => {
        dispatch({ type: 'fetchDatasetsFailed', error });
      },
    );
    dispatch({ type: 'fetchDatasetsStarted' });
  });

  // HISTORY
  // Ensure route uuid and history are always in sync. The main route.uuid ALWAYS FOLLOWS
  // the actual URL. Order of precedence:
  // 1. route.nextUuid - set by dispatch, gets pushed into history
  // 2. location.pathname - literally the URL, route.uuid follows this
  // 3. route.uuid - only ever set directly from URL parsing
  const history = useHistory();
  const location = useLocation();
  const { pathname } = location;
  useEffect(() => {
    if (appStatus === APP_STATUS.INITIALIZING) { return; }
    const locationUuid = getUuidFromURL(pathname);
    // Next uuid differs from location: navigate to next uuid and apply to state
    if (routeNextUuid !== undefined && routeNextUuid !== locationUuid) {
      const nextLocation = routeNextUuid === null
        ? '/prototype-datasets/'
        : `/prototype-datasets/${routeNextUuid}/`;
      history.push(nextLocation);
      dispatch({ type: 'applyNextUuid' });
      return;
    }
    // Next uuid differs from current: apply next uuid to state (used after browser nav)
    if (routeNextUuid !== undefined && routeNextUuid !== routeUuid) {
      dispatch({ type: 'applyNextUuid' });
      return;
    }
    // Location differs from current uuid: set the location as the next uuid
    if (locationUuid !== routeUuid) {
      dispatch({ type: 'setNextUuid', uuid: locationUuid });
    }
  }, [appStatus, history, pathname, routeUuid, routeNextUuid]);

  /**
     Render
  */
  return (
    <Context.Provider value={[state, dispatch]}>
      {children}
    </Context.Provider>
  );
};

Provider.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.oneOfType([
      PropTypes.node,
      PropTypes.string,
    ])),
    PropTypes.node,
    PropTypes.string,
  ]).isRequired,
};

Provider.defaultProps = {};

/**
   EXPORT
*/
const PrototypeContext = {
  Provider,
  usePrototypeContextState,
  APP_STATUS,
  DEFAULT_STATE,
};

export default PrototypeContext;