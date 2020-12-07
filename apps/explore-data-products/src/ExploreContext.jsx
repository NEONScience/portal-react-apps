/* eslint-disable import/no-unresolved */
import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
} from 'react';
import PropTypes from 'prop-types';

import logger from 'use-reducer-logger';

import { of } from 'rxjs';
import { ajax } from 'rxjs/ajax';
import { map, catchError } from 'rxjs/operators';

import cloneDeep from 'lodash/cloneDeep';

import NeonContext from 'portal-core-components/lib/components/NeonContext';
import NeonGraphQL from 'portal-core-components/lib/components/NeonGraphQL';
import NeonEnvironment from 'portal-core-components/lib/components/NeonEnvironment';

import {
  applyCurrentProducts,
  parseURLParam,
  parseProductsByReleaseData,
  parseAnyUnparsedProductSets,
} from './util/stateUtil';

import {
  /* constants */
  DEFAULT_SORT_METHOD,
  DEFAULT_SORT_DIRECTION,
  FILTER_ITEM_VISIBILITY_STATES,
  FILTER_KEYS,
  INITIAL_FILTER_ITEM_VISIBILITY,
  INITIAL_FILTER_ITEMS,
  INITIAL_FILTER_VALUES,
  LATEST_AND_PROVISIONAL,
  /* functions */
  applyFilter,
  changeFilterItemVisibility,
  resetAllFilters,
  resetFilter,
} from './util/filterUtil';

export const FETCH_STATUS = {
  AWAITING_CALL: 'AWAITING_CALL',
  FETCHING: 'FETCHING',
  ERROR: 'ERROR',
  SUCCESS: 'SUCCESS',
};

export const APP_STATUS = {
  HAS_FETCHES_TO_TRIGGER: 'HAS_FETCHES_TO_TRIGGER',
  FETCHING: 'FETCHING',
  READY: 'READY',
  ERROR: 'ERROR',
};

const DEFAULT_STATE = {
  appStatus: APP_STATUS.HAS_FETCHES_TO_TRIGGER,

  fetches: {
    productsByRelease: {
      [LATEST_AND_PROVISIONAL]: { status: FETCH_STATUS.AWAITING_CALL },
    },
    aopVizProducts: { status: FETCH_STATUS.AWAITING_CALL },
  },

  productsByRelease: {
    [LATEST_AND_PROVISIONAL]: {},
  },
  aopVizProducts: [],

  neonContextState: cloneDeep(NeonContext.DEFAULT_STATE),

  // Unparsed values sniffed from URL params to seed initial filter values
  // This is here primarily for backward-compatibility with legacy portal pages.
  // (pages that want to link to browse with a filter payload)
  // We don't want to support all filters here. Future iterations should look
  // at more elegant / scalable approaches to arbitrary state injection.
  urlParams: {
    search: null,
    release: null,
    sites: [],
    states: [],
    domains: [],
  },

  // Unparsed search input value sniffed from local storage
  // We only want to pull this out when we initialize the page
  localStorageSearch: localStorage.getItem('search'),

  currentProducts: {
    release: null,
    order: [], // Sorted list of product codes
    visibility: {}, // Mapping by productCode to object containing filter+absolute booleans to track visibility
    searchRelevance: {}, // Mapping of productCode to a relevance number for current applied search terms
  },
  productsDescriptionExpanded: {}, // Mapping by productCode to booleans to track expanded descriptions
  
  releases: [], // Array of all release objects known to exist (with tags, generation dates, and product codes)

  catalogStats: { // Stats about the entire product catalog independent of release, derived once on load
    totalProducts: 0,
    totalSites: 0,
    totalDateRange: [null, null],
  },

  scrollCutoff: 10, // How many potentially visible products to actually show; increase with scroll / reset with filter change
  
  catalogSummaryVisible: false, // Whether catalog summary section is expanded (for xs/sm vieports only)

  sortVisible: false, // Whether sort section is expanded (for xs/sm vieports only)
  sortMethod: DEFAULT_SORT_METHOD,
  sortDirection: DEFAULT_SORT_DIRECTION,

  keywords: {
    all: new Set(),
    allByLetter: {}, // Additional store for list of all unique keywords, sorted by first letter.
  },

  filterItems: cloneDeep(INITIAL_FILTER_ITEMS), // Store for all discrete options for filters that make use of them
  filterValues: cloneDeep(INITIAL_FILTER_VALUES), // Store for current values applied for all filters
  filterItemVisibility: cloneDeep(INITIAL_FILTER_ITEM_VISIBILITY), // Expanded / collapsed / selected states for filters with >5 options visibility buttons
  filtersApplied: [], // List of filter keys that have been applied / are not in a cleared state
  filtersVisible: false, // Whether filter section is expanded (for xs/sm vieports only)

  activeDataVisualization: {
    component: null,
    productCode: null,
  },
};

const fetchIsInStatus = (fetchObject, status) => (
  typeof fetchObject === 'object' && fetchObject !== null && fetchObject.status === status
);

const fetchIsAwaitingCall = fetchObject => fetchIsInStatus(fetchObject, FETCH_STATUS.AWAITING_CALL);

const stateHasFetchesInStatus = (state, status) => (
  Object.keys(state.fetches.productsByRelease).some(
    release => fetchIsInStatus(state.fetches.productsByRelease[release], status),
  )
  // NOTE: we only care about the aopVizProducts fetch if it's awaiting fetch, so it can be
  // triggered. Otherwise it should never affect app-level status.
  || (
    status === FETCH_STATUS.AWAITING_CALL && fetchIsInStatus(state.fetches.aopVizProducts, status)
  )
);

const calculateFetches = (state) => {
  const newState = { ...state };
  const { [FILTER_KEYS.RELEASE]: currentRelease } = state.filterValues;
  if (currentRelease && !state.fetches.productsByRelease[currentRelease]) {
    newState.fetches.productsByRelease[currentRelease] = { status: FETCH_STATUS.AWAITING_CALL };
  }
  return newState;
};

const calculateAppStatus = (state) => {
  const updatedState = { ...state };
  if (stateHasFetchesInStatus(state, FETCH_STATUS.AWAITING_CALL)) {
    updatedState.appStatus = APP_STATUS.HAS_FETCHES_TO_TRIGGER;
    return updatedState;
  }
  if (stateHasFetchesInStatus(state, FETCH_STATUS.ERROR)) {
    updatedState.appStatus = APP_STATUS.ERROR;
    return updatedState;
  }
  if (stateHasFetchesInStatus(state, FETCH_STATUS.FETCHING) || !state.neonContextState.isFinal) {
    updatedState.appStatus = APP_STATUS.FETCHING;
    return updatedState;
  }
  updatedState.appStatus = APP_STATUS.READY;
  return updatedState;
};

/**
   CONTEXT
*/
const Context = createContext(DEFAULT_STATE);

/**
   HOOK
*/
const useExploreContextState = () => {
  const hookResponse = useContext(Context);
  if (hookResponse.length !== 2) {
    return [cloneDeep(DEFAULT_STATE), () => {}];
  }
  return hookResponse;
};

/**
   REDUCER
*/
const reducer = (state, action) => {
  const newState = { ...state };
  let f = null;
  switch (action.type) {
    // Neon Context
    case 'storeFinalizedNeonContextState':
      return calculateAppStatus(parseAnyUnparsedProductSets({
        ...newState,
        neonContextState: action.neonContextState,
      }));

    // Fetch Handling
    case 'fetchProductsByReleaseReleaseFailed':
      if (!newState.fetches.productsByRelease[action.release]) { return newState; }
      newState.fetches.productsByRelease[action.release].status = FETCH_STATUS.ERROR;
      newState.fetches.productsByRelease[action.release].error = action.error;
      return calculateAppStatus(newState);
    case 'fetchProductsByReleaseSucceeded':
      if (!newState.fetches.productsByRelease[action.release]) { return newState; }
      newState.fetches.productsByRelease[action.release].status = FETCH_STATUS.SUCCESS;
      newState.fetches.productsByRelease[action.release].unparsedData = action.data;
      return calculateAppStatus(parseProductsByReleaseData(newState, action.release, action));

    case 'fetchAopVizProductsFailed':
      newState.fetches.aopVizProducts.status = FETCH_STATUS.ERROR;
      newState.fetches.aopVizProducts.error = action.error;
      return calculateAppStatus(newState);
    case 'fetchAopVizProductsSucceeded':
      newState.fetches.aopVizProducts.status = FETCH_STATUS.SUCCESS;
      newState.aopVizProducts = action.data;
      return calculateAppStatus(newState);

    case 'fetchesStarted':
      newState.fetches = { ...action.fetches };
      return calculateAppStatus(newState);

    // Filter
    case 'resetFilter':
      return resetFilter(newState, action.filterKey);
    case 'resetAllFilters':
      return resetAllFilters(newState);

    case 'applyFilter':
      if (action.showOnlySelected) { 
        return changeFilterItemVisibility(
          applyFilter(state, action.filterKey, action.filterValue),
          action.filterKey,
          FILTER_ITEM_VISIBILITY_STATES.SELECTED,
        );
      }
      return calculateFetches(
        applyCurrentProducts(
          applyFilter(state, action.filterKey, action.filterValue),
        ),
      );

    case 'expandFilterItems':
      return changeFilterItemVisibility(state, action.filterKey, FILTER_ITEM_VISIBILITY_STATES.EXPANDED);
    case 'collapseFilterItems':
      return changeFilterItemVisibility(state, action.filterKey, FILTER_ITEM_VISIBILITY_STATES.COLLAPSED);
    case 'showSelectedFilterItems':
      return changeFilterItemVisibility(state, action.filterKey, FILTER_ITEM_VISIBILITY_STATES.SELECTED);

    case 'toggleFilterVisiblity':
      return { ...newState, filtersVisible: !state.filtersVisible };

    // Sort
    case 'toggleSortVisiblity':
      return { ...newState, sortVisible: !state.sortVisible };

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

  /**
    State initialization
  */
  const initialState = cloneDeep(DEFAULT_STATE);

  // Pull params from the URL into state exactly once on initialization
  Object.keys(initialState.urlParams).forEach((param) => {
    initialState.urlParams[param] = parseURLParam(param);
  });

  const [state, dispatch] = useReducer(
    process.env.NODE_ENV === 'development' ? logger(reducer) : reducer,
    initialState,
  );

  const {
    appStatus,
    fetches,
  } = state;

  /**
     Effects
  */
  // Trigger any fetches that are awaiting call
  useEffect(() => {
    if (appStatus !== APP_STATUS.HAS_FETCHES_TO_TRIGGER) { return; }
    const newFetches = cloneDeep(fetches);
    // Product release fetches
    Object.keys(fetches.productsByRelease)
      .filter(release => fetchIsAwaitingCall(fetches.productsByRelease[release]))
      .forEach((release) => {
        newFetches.productsByRelease[release].status = FETCH_STATUS.FETCHING;
        const releaseArg = release === LATEST_AND_PROVISIONAL ? null : release;
        NeonGraphQL.getAllDataProducts(releaseArg).pipe(
          map((response) => {
            dispatch({
              type: 'fetchProductsByReleaseSucceeded',
              release,
              data: (response.response || {}).data || {},
            });
            return true;
          }),
          catchError((error) => {
            dispatch({
              type: 'fetchProductsByReleaseReleaseFailed',
              release,
              error,
            });
            return false;
          }),
        ).subscribe();
      });
    // Fetch the list of product codes supported by Visus for the AOP Viewer Visualization
    if (fetchIsAwaitingCall(fetches.aopVizProducts)) {
      newFetches.aopVizProducts.status = FETCH_STATUS.FETCHING;
      ajax.getJSON(NeonEnvironment.getVisusProductsBaseUrl()).pipe(
        map((response) => {
          dispatch({
            type: 'fetchAopVizProductsSucceeded',
            data: response.data,
          });
        }),
        catchError((error) => {
          dispatch({
            type: 'fetchAopVizProductsFailed',
            error,
          });
          return of('AOP visualization products fetch failed');
        }),
      ).subscribe();
    }
    dispatch({ type: 'fetchesStarted', fetches: newFetches });
  }, [appStatus, fetches]);

  /**
     Render
  */
  return (
    <Context.Provider value={[state, dispatch]}>
      {children}
    </Context.Provider>
  );
};

/**
   Prop Types
*/
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
const DataProductContext = {
  Provider,
  useExploreContextState,
  APP_STATUS,
  DEFAULT_STATE,
};

export default DataProductContext;
