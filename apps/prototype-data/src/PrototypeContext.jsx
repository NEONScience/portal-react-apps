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
import NeonEnvironment from 'portal-core-components/lib/components/NeonEnvironment/NeonEnvironment';
import NeonJsonLd from 'portal-core-components/lib/components/NeonJsonLd';

import {
  /* constants */
  DEFAULT_SORT_METHOD,
  DEFAULT_SORT_DIRECTION,
  FILTER_ITEM_VISIBILITY_STATES,
  FILTER_KEYS,
  INITIAL_FILTER_ITEM_VISIBILITY,
  INITIAL_FILTER_ITEMS,
  INITIAL_FILTER_VALUES,
  /* functions */
  applySort,
  applyFilter,
  getUuidFromURL,
  changeFilterItemVisibility,
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
  datasets: {},
  unparsedDatasets: {},
  manifestRollupFetches: {},
  manifestRollups: {},

  // Store for current visible datasets based on user inputs (and how they're sorted)
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
    totalTimeRange: [null, null],
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
  // Expanded / collapsed / selected states for filters with >5 options visibility buttons
  filterItemVisibility: cloneDeep(INITIAL_FILTER_ITEM_VISIBILITY),
  // List of filter keys that have been applied / are not in a cleared state
  filtersApplied: [],
  // Whether filter section is expanded (for xs/sm vieports only)
  filtersVisible: false,
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
  const {
    datasetsFetch: { status: datasetsFetchStatus },
    route: { uuid: routeUuid },
    manifestRollupFetches,
    datasets,
  } = state;
  const newState = { ...state };
  if (datasetsFetchStatus === FETCH_STATUS.AWAITING_CALL) {
    newState.app.status = APP_STATUS.INITIALIZING;
    return newState;
  }
  if (datasetsFetchStatus === FETCH_STATUS.ERROR) {
    newState.app.status = APP_STATUS.ERROR;
    newState.app.error = 'Unable to load datasets';
    return newState;
  }
  const pendingManifestFetches = Object.keys(state.manifestRollupFetches).filter((uuid) => (
    [FETCH_STATUS.AWAITING_CALL, FETCH_STATUS.FETCHING].includes(manifestRollupFetches[uuid].status)
  ));
  if (
    datasetsFetchStatus === FETCH_STATUS.FETCHING
      || !state.neonContextState.isFinal
      || pendingManifestFetches.length > 0
  ) {
    newState.app.status = APP_STATUS.FETCHING;
    return newState;
  }
  // Error if datasets are loaded and route UUID is defined but not in datasets
  if (datasetsFetchStatus === FETCH_STATUS.SUCCESS && routeUuid && !datasets[routeUuid]) {
    newState.app.status = APP_STATUS.ERROR;
    newState.app.error = `Dataset not found: ${routeUuid}`;
    return newState;
  }
  newState.app.status = APP_STATUS.READY;
  return newState;
};

const calculateManifestRollupFetches = (state) => {
  const newState = { ...state };
  const { datasets, route: { uuid, nextUuid } } = newState;
  if (uuid && datasets[uuid] && !newState.manifestRollupFetches[uuid]) {
    newState.manifestRollupFetches[uuid] = {
      status: FETCH_STATUS.AWAITING_CALL, error: null,
    };
  }
  if (nextUuid && datasets[nextUuid] && !newState.manifestRollupFetches[nextUuid]) {
    newState.manifestRollupFetches[nextUuid] = {
      status: FETCH_STATUS.AWAITING_CALL, error: null,
    };
  }
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

  let tempState = null;
  switch (action.type) {
    // Initialization
    case 'reinitialize':
      return cloneDeep(DEFAULT_STATE);

    // Routing
    case 'setInitialRouteToUuid':
      newState.route.uuid = action.uuid || null;
      newState.route.nextUuid = undefined;
      return calculateManifestRollupFetches(newState);
    case 'setNextUuid':
      newState.route.nextUuid = action.uuid;
      return calculateManifestRollupFetches(newState);
    case 'applyNextUuid':
      newState.route.uuid = newState.route.nextUuid;
      newState.route.nextUuid = undefined;
      return calculateManifestRollupFetches(newState);

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
      newState = parseAllDatasets(newState);
      newState = calculateManifestRollupFetches(newState);
      return calculateAppStatus(newState);

    // Fetch manifest rollups
    case 'fetchManifestRollupStarted':
      if (!newState.manifestRollupFetches[action.uuid]) { return state; }
      newState.manifestRollupFetches[action.uuid].status = FETCH_STATUS.FETCHING;
      return calculateAppStatus(newState);
    case 'fetchManifestRollupFailed':
      if (!newState.manifestRollupFetches[action.uuid]) { return state; }
      newState.manifestRollupFetches[action.uuid].status = FETCH_STATUS.ERROR;
      newState.manifestRollupFetches[action.uuid].error = action.error;
      return calculateAppStatus(newState);
    case 'fetchManifestRollupSucceeded':
      if (!newState.manifestRollupFetches[action.uuid]) { return state; }
      newState.manifestRollupFetches[action.uuid].status = FETCH_STATUS.SUCCESS;
      newState.manifestRollups[action.uuid] = action.data;
      return calculateAppStatus(newState);

    // Sort
    case 'applySort':
      return applySort(state, action.method, action.direction);

    // Filter
    case 'resetFilter':
      return resetFilter(newState, action.filterKey);
    case 'resetAllFilters':
      return resetAllFilters(newState);
    case 'applyFilter':
      tempState = calculateAppStatus(
        applyFilter(state, action.filterKey, action.filterValue),
      );
      return !action.showOnlySelected
        ? tempState
        : changeFilterItemVisibility(
          tempState,
          action.filterKey,
          FILTER_ITEM_VISIBILITY_STATES.SELECTED,
        );
    case 'expandFilterItems':
      return changeFilterItemVisibility(
        state,
        action.filterKey,
        FILTER_ITEM_VISIBILITY_STATES.EXPANDED,
      );
    case 'collapseFilterItems':
      return changeFilterItemVisibility(
        state,
        action.filterKey,
        FILTER_ITEM_VISIBILITY_STATES.COLLAPSED,
      );
    case 'showSelectedFilterItems':
      return changeFilterItemVisibility(
        state,
        action.filterKey,
        FILTER_ITEM_VISIBILITY_STATES.SELECTED,
      );

    case 'toggleFilterVisiblity':
      return { ...newState, filtersVisible: !state.filtersVisible };

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
    manifestRollupFetches,
    neonContextState: {
      isFinal: neonContextIsFinal,
    },
  } = state;

  const awaitingManifestFetches = Object.keys(manifestRollupFetches).filter((uuid) => (
    manifestRollupFetches[uuid].status === FETCH_STATUS.AWAITING_CALL
  ));

  const history = useHistory();
  const location = useLocation();
  const { pathname } = location;

  /**
     Effects
  */
  // Parse UUID out of the route (URL) and set the initial route if not null
  // If we don't parse a UUID but see that there's *something* in the URL then replace the current
  // URL with the cleaned-up base URL (explore)
  useEffect(() => {
    if (appStatus !== APP_STATUS.INITIALIZING) { return; }
    const regex = new RegExp(`^${NeonEnvironment.getRouterBaseHomePath()}\\/(.+)`);
    const urlHasArg = regex.test(pathname);
    const uuid = getUuidFromURL();
    if (!uuid) {
      NeonJsonLd.removeAllMetadata();
      if (urlHasArg) { history.replace(`${NeonEnvironment.getRouterBaseHomePath()}`); }
      return;
    }
    dispatch({ type: 'setInitialRouteToUuid', uuid });
  }, [appStatus, history, pathname]);

  // Trigger initial prototype datasets fetch
  useEffect(() => {
    if (!neonContextIsFinal) { return; }
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
  }, [appStatus, datasetsFetchStatus, neonContextIsFinal]);

  // Trigger any awaiting manifest fetches
  useEffect(() => {
    if (!awaitingManifestFetches.length) { return; }
    awaitingManifestFetches.forEach((uuid) => {
      NeonApi.getPrototypeManifestRollupObservable(uuid).subscribe(
        (response) => {
          dispatch({ type: 'fetchManifestRollupSucceeded', uuid, data: response.data });
        },
        (error) => {
          dispatch({ type: 'fetchManifestRollupFailed', uuid, error });
        },
      );
      dispatch({ type: 'fetchManifestRollupStarted', uuid });
    });
  }, [awaitingManifestFetches]);

  // HISTORY
  // Ensure route uuid and history are always in sync. The main route.uuid ALWAYS FOLLOWS
  // the actual URL. Order of precedence:
  // 1. route.nextUuid - set by dispatch, gets pushed into history
  // 2. location.pathname - literally the URL, route.uuid follows this
  // 3. route.uuid - only ever set directly from URL parsing
  useEffect(() => {
    if (appStatus === APP_STATUS.INITIALIZING) { return; }
    const locationUuid = getUuidFromURL(pathname);
    // Next uuid differs from location: navigate to next uuid and apply to state
    if (routeNextUuid !== undefined && routeNextUuid !== locationUuid) {
      const missingNextUuid = routeNextUuid === null;
      const baseRoute = NeonEnvironment.getRouterBaseHomePath();
      const nextLocation = missingNextUuid
        ? baseRoute
        : `${baseRoute}/${routeNextUuid}`;
      history.push(nextLocation);
      if (missingNextUuid) {
        NeonJsonLd.removeAllMetadata();
      } else {
        NeonJsonLd.injectPrototypeDataset(routeNextUuid);
      }
      dispatch({ type: 'applyNextUuid' });
      return;
    }
    // Next uuid differs from current: apply next uuid to state (used after browser nav)
    if (routeNextUuid !== undefined && routeNextUuid !== routeUuid) {
      NeonJsonLd.removeAllMetadata();
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
