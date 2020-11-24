/* eslint-disable import/no-unresolved */
import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
} from 'react';
import PropTypes from 'prop-types';

import { of } from 'rxjs';
import { ajax } from 'rxjs/ajax';
import { map, catchError } from 'rxjs/operators';

import { useHistory, useLocation } from 'react-router-dom';

import cloneDeep from 'lodash/cloneDeep';

import NeonApi from 'portal-core-components/lib/components/NeonApi';
import NeonContext from 'portal-core-components/lib/components/NeonContext';
import NeonEnvironment from 'portal-core-components/lib/components/NeonEnvironment';

const FETCH_STATUS = {
  AWAITING_CALL: 'AWAITING_CALL',
  FETCHING: 'FETCHING',
  ERROR: 'ERROR',
  SUCCESS: 'SUCCESS',
};

const APP_STATUS = {
  INITIALIZING: 'INITIALIZING',
  HAS_FETCHES_TO_TRIGGER: 'HAS_FETCHES_TO_TRIGGER',
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
  route: {
    productCode: null,
    release: null,
    bundle: {
      parentCodes: [],
      forwardAvailabilityFromParent: null,
    },
    nextRelease: undefined,
    nextHash: undefined,
  },
  fetches: {
    product: null,
    productReleases: {},
    bundleParents: {},
    bundleParentReleases: {},
    aopVizProducts: null,
  },
  data: {
    product: null,
    productReleases: {},
    bundleParents: {},
    bundleParentReleases: {},
    aopVizProducts: [],
  },
};

const fetchIsInStatus = (fetchObject, status) => (
  typeof fetchObject === 'object' && fetchObject !== null && fetchObject.status === status
);

const fetchIsAwaitingCall = fetchObject => fetchIsInStatus(fetchObject, FETCH_STATUS.AWAITING_CALL);

const stateHasFetchesInStatus = (state, status) => (
  fetchIsInStatus(state.fetches.product, status)
    || Object.keys(state.fetches.productReleases).some(
      f => fetchIsInStatus(state.fetches.productReleases[f], status),
    )
    || Object.keys(state.fetches.bundleParents).some(
      f => fetchIsInStatus(state.fetches.bundleParents[f], status),
    )
    || Object.keys(state.fetches.bundleParentReleases).some(
      bundleParent => Object.keys(state.fetches.bundleParentReleases[bundleParent]).some(
        f => fetchIsInStatus(state.fetches.bundleParentReleases[bundleParent][f], status),
      ),
    )
    // NOTE: we only care about the aopVizProducts fetch if it's awaiting fetch, so it can be
    // triggered. Otherwise it should never affect app-level status.
    || (
      status === FETCH_STATUS.AWAITING_CALL && fetchIsInStatus(state.fetches.aopVizProducts, status)
    )
);

const calculateFetches = (state) => {
  const newState = { ...state };
  const {
    productCode,
    release,
    bundle: { parentCodes, forwardAvailabilityFromParent },
  } = state.route;
  if (!productCode) { return state; }
  if (!state.fetches.product) {
    newState.fetches.product = { status: FETCH_STATUS.AWAITING_CALL };
  }
  if (!state.fetches.aopVizProducts) {
    newState.fetches.aopVizProducts = { status: FETCH_STATUS.AWAITING_CALL };
  }
  if (release && !state.fetches.productReleases[release]) {
    newState.fetches.productReleases[release] = { status: FETCH_STATUS.AWAITING_CALL };
  }
  (parentCodes || []).forEach((bundleParentCode) => {
    newState.fetches.bundleParents[bundleParentCode] = { status: FETCH_STATUS.AWAITING_CALL };
  });
  if (release && forwardAvailabilityFromParent) {
    parentCodes.forEach((parentCode) => {
      newState.fetches.bundleParentReleases[parentCode][release] = {
        status: FETCH_STATUS.AWAITING_CALL,
      };
    });
  }
  return newState;
};

const calculateAppStatus = (state) => {
  const updatedState = { ...state };
  if (stateHasFetchesInStatus(state, FETCH_STATUS.AWAITING_CALL)) {
    updatedState.app.status = APP_STATUS.HAS_FETCHES_TO_TRIGGER;
    return updatedState;
  }
  if (stateHasFetchesInStatus(state, FETCH_STATUS.ERROR)) {
    updatedState.app.status = APP_STATUS.ERROR;
    return updatedState;
  }
  if (stateHasFetchesInStatus(state, FETCH_STATUS.FETCHING)) {
    updatedState.app.status = APP_STATUS.FETCHING;
    return updatedState;
  }
  updatedState.app.status = APP_STATUS.READY;
  return updatedState;
};

const getProductCodeAndReleaseFromURL = (pathname = window.location.pathname) => {
  const regex = /data-products\/(DP[0-9]{1}\.[0-9]{5}\.[0-9]{3})\/?([\w-]+)?/g;
  const urlParts = regex.exec(pathname);
  return !urlParts ? [null, null] : [urlParts[1], urlParts[2] || null];
};

// Evaluates a complete state object to extract the product data currently in focus, be it the
// general / top-level product or a specific release.
const getCurrentProductFromState = (state = DEFAULT_STATE, forAvailability = false) => {
  const {
    route: {
      productCode,
      release: currentRelease,
      bundle: { forwardAvailabilityFromParent },
    },
    data: {
      product: generalProduct,
      productReleases,
      bundleParents,
      bundleParentReleases,
    },
  } = state;
  if (!productCode) { return null; }
  // Forward Availability - if requested by the forAvailability param look to the bundle parents
  if (forAvailability && forwardAvailabilityFromParent) {
    // Bundles can have more than one parent AND can forward availability. Presently no bundle does
    // both, so here we can safely just take the first parent code as the one from which to forward
    // availability. If we ever need to forward availability from more than one bundle parent this
    // logic will need to be refactored.
    const firstParentCode = Object.keys(bundleParents)[0] || null;
    if (!firstParentCode) { return null; }
    if (!currentRelease) { return bundleParents[firstParentCode]; }
    if (
      !bundleParentReleases[firstParentCode]
        || !bundleParentReleases[firstParentCode][currentRelease]
    ) { return null; }
    return bundleParentReleases[firstParentCode][currentRelease];
  }
  // No availability forwarding - return either the general product or the release
  if (!currentRelease) { return generalProduct; }
  if (!productReleases[currentRelease]) { return null; }
  return productReleases[currentRelease];
};

/**
   CONTEXT
*/
const Context = createContext(DEFAULT_STATE);

/**
   HOOK
*/
const useDataProductContextState = () => {
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
  switch (action.type) {
    case 'reinitialize':
      return cloneDeep(DEFAULT_STATE);
    case 'error':
      newState.app.status = APP_STATUS.ERROR;
      newState.app.error = action.error;
      return newState;

    // Route parsing from initialization only.
    // See 'setNextRelease' when route changes with respect to release after initialization
    case 'parseRoute':
      // Fill in state.route from action
      newState.route.productCode = action.productCode;
      newState.route.release = action.release;
      if (action.bundleParentCodes) {
        newState.route.bundle.parentCodes = action.bundleParentCodes;
        // eslint-disable-next-line max-len
        newState.route.bundle.forwardAvailabilityFromParent = action.bundleForwardAvailabilityFromParent;
      }
      // Initialize fetches, set app status, and return
      return calculateAppStatus(calculateFetches(newState));

    case 'fetchesStarted':
      newState.fetches = { ...action.fetches };
      return calculateAppStatus(newState);

    case 'fetchProductFailed':
      newState.fetches.product.status = FETCH_STATUS.ERROR;
      newState.fetches.product.error = action.error;
      newState.app.error = `Fetching base product failed: ${action.error.message}`;
      return calculateAppStatus(newState);
    case 'fetchProductSucceeded':
      newState.fetches.product.status = FETCH_STATUS.SUCCESS;
      newState.data.product = action.data;
      if (newState.data.product.dois && newState.data.product.dois.length > 1) {
        newState.data.product.dois.sort((a, b) => (a.generationDate < b.generationDate ? 1 : -1));
      }
      newState.data.product.dois
        // eslint-disable-next-line max-len
        .filter(doi => !Object.prototype.hasOwnProperty.call(newState.data.productReleases, doi.release))
        .forEach((doi) => { newState.data.productReleases[doi.release] = null; });
      return calculateAppStatus(newState);

    case 'fetchProductReleaseFailed':
      newState.fetches.productReleases[action.release].status = FETCH_STATUS.ERROR;
      newState.fetches.productReleases[action.release].error = action.error;
      // eslint-disable-next-line max-len
      newState.app.error = `Fetching product release ${action.release} failed: ${action.error.message}`;
      return calculateAppStatus(newState);
    case 'fetchProductReleaseSucceeded':
      newState.fetches.productReleases[action.release].status = FETCH_STATUS.SUCCESS;
      newState.data.productReleases[action.release] = action.data;
      return calculateAppStatus(newState);

    case 'fetchBundleParentFailed':
      newState.fetches.bundleParents[action.bundleParent].status = FETCH_STATUS.ERROR;
      newState.fetches.bundleParents[action.bundleParent].error = action.error;
      // eslint-disable-next-line max-len
      newState.app.error = `Fetching bundle parent product ${action.bundleParent} failed: ${action.error.message}`;
      return calculateAppStatus(newState);
    case 'fetchBundleParentSucceeded':
      newState.fetches.bundleParents[action.bundleParent].status = FETCH_STATUS.SUCCESS;
      newState.data.bundleParents[action.bundleParent] = action.data;
      return calculateAppStatus(newState);

    case 'fetchBundleParentReleaseFailed':
      /* eslint-disable max-len */
      newState.fetches.bundleParents[action.bundleParent][action.release].status = FETCH_STATUS.ERROR;
      newState.fetches.bundleParents[action.bundleParent][action.release].error = action.error;
      newState.app.error = `Fetching bundle parent product ${action.bundleParent} release ${action.release} failed: ${action.error.message}`;
      /* eslint-enable max-len */
      return calculateAppStatus(newState);
    case 'fetchBundleParentReleaseSucceeded':
      // eslint-disable-next-line max-len
      newState.fetches.bundleParents[action.bundleParent][action.release].status = FETCH_STATUS.SUCCESS;
      newState.data.bundleParents[action.bundleParent][action.release] = action.data;
      return calculateAppStatus(newState);

    case 'fetchAOPVizProductsFailed':
      newState.fetches.aopVizProducts.status = FETCH_STATUS.ERROR;
      newState.fetches.aopVizProducts.error = action.error;
      return calculateAppStatus(newState);
    case 'fetchAOPVizProductsSucceeded':
      newState.fetches.aopVizProducts.status = FETCH_STATUS.SUCCESS;
      newState.data.aopVizProducts = action.data;
      return calculateAppStatus(newState);

    case 'setNextRelease':
      newState.route.nextRelease = action.release;
      if (action.hash) { newState.route.nextHash = action.hash.replace(/#/g, ''); }
      return calculateAppStatus(newState);
    case 'applyNextRelease':
      newState.route.release = newState.route.nextRelease;
      newState.route.nextRelease = undefined;
      newState.route.nextHash = undefined;
      return calculateAppStatus(calculateFetches(newState));

    // Default
    default:
      return state;
  }
};
const wrappedReducer = (state, action) => {
  const newState = reducer(state, action);
  console.log('STATE', action, newState);
  return newState;
};

/**
   PROVIDER
*/
const Provider = (props) => {
  const { children } = props;

  const initialState = cloneDeep(DEFAULT_STATE);
  const [state, dispatch] = useReducer(wrappedReducer, initialState);

  const [{ data: neonContextData }] = NeonContext.useNeonContextState();
  const { bundles } = neonContextData;

  const {
    app: { status },
    route: {
      productCode,
      release: currentRelease,
      nextRelease,
      nextHash,
    },
    fetches,
  } = state;

  /**
     Effects
  */
  // Parse productCode and release out of the route (URL). Also pull bundle data out of NeonContext
  useEffect(() => {
    if (status !== APP_STATUS.INITIALIZING) { return; }
    const [routeProductCode, routeRelease] = getProductCodeAndReleaseFromURL();
    if (!routeProductCode) {
      dispatch({ type: 'error', error: 'Data product not found.' });
    }
    let bundleParentCodes = null;
    let bundleForwardAvailabilityFromParent = null;
    if (bundles.children && bundles.children[routeProductCode]) {
      bundleParentCodes = [bundles.children[routeProductCode]].flat();
      bundleForwardAvailabilityFromParent = false;
      if (
        bundleParentCodes.length === 1
          && bundles.parents[bundleParentCodes[0]].forwardAvailability
      ) {
        bundleForwardAvailabilityFromParent = true;
      }
    }
    dispatch({
      type: 'parseRoute',
      productCode: routeProductCode,
      release: routeRelease,
      bundleParentCodes,
      bundleForwardAvailabilityFromParent,
    });
  }, [status, bundles]);

  // HISTORY
  // Ensure route release and history are always in sync. The main route.release ALWAYS FOLLOWS
  // the actual URL. Order of precedence:
  // 1. route.nextRelease - set by dispatch, gets pushed into history
  // 2. location.pathname - literally the URL, route.release follows this
  // 3. route.release - only ever set from URL parsing
  const history = useHistory();
  const location = useLocation();
  const { pathname } = location;
  useEffect(() => {
    if (status === APP_STATUS.INITIALIZING) { return; }
    const [locationProductCode, locationRelease] = getProductCodeAndReleaseFromURL(pathname);
    if (locationProductCode !== productCode) {
      dispatch({ type: 'reinitialize' });
      return;
    }
    if (nextRelease !== undefined && nextRelease !== locationRelease) {
      let nextLocation = nextRelease === null
        ? `/data-products/${productCode}`
        : `/data-products/${productCode}/${nextRelease}`;
      if (nextHash) { nextLocation = `${nextLocation}#${nextHash}`; }
      history.push(nextLocation);
      dispatch({ type: 'applyNextRelease' });
      return;
    }
    if (locationRelease !== currentRelease) {
      dispatch({ type: 'setNextRelease', release: locationRelease });
    }
  }, [status, history, pathname, productCode, currentRelease, nextRelease, nextHash]);

  // Trigger any fetches that are awaiting call
  useEffect(() => {
    if (status !== APP_STATUS.HAS_FETCHES_TO_TRIGGER) { return; }
    const newFetches = cloneDeep(fetches);
    // Base product fetch
    if (fetchIsAwaitingCall(fetches.product)) {
      newFetches.product.status = FETCH_STATUS.FETCHING;
      NeonApi.getProductObservable(productCode).subscribe(
        (response) => {
          dispatch({ type: 'fetchProductSucceeded', data: response.data });
        },
        (error) => {
          dispatch({ type: 'fetchProductFailed', error });
        },
      );
    }
    // Product release fetches
    Object.keys(fetches.productReleases)
      .filter(release => fetchIsAwaitingCall(fetches.productReleases[release]))
      .forEach((release) => {
        newFetches.productReleases[release].status = FETCH_STATUS.FETCHING;
        NeonApi.getProductObservable(productCode, release).subscribe(
          (response) => {
            dispatch({ type: 'fetchProductReleaseSucceeded', release, data: response.data });
          },
          (error) => {
            dispatch({ type: 'fetchProductReleaseFailed', release, error });
          },
        );
      });
    // Bundle parent fetches
    Object.keys(fetches.bundleParents)
      .filter(bundleParent => fetchIsAwaitingCall(fetches.bundleParents[bundleParent]))
      .forEach((bundleParent) => {
        newFetches.bundleParents[bundleParent].status = FETCH_STATUS.FETCHING;
        NeonApi.getProductObservable(bundleParent).subscribe(
          (response) => {
            dispatch({ type: 'fetchBundleParentSucceeded', bundleParent, data: response.data });
          },
          (error) => {
            dispatch({ type: 'fetchBundleParentFailed', bundleParent, error });
          },
        );
      });
    // Bundle parent release fetches
    Object.keys(fetches.bundleParentReleases)
      .forEach((bundleParent) => {
        Object.keys(fetches.bundleParentReleases[bundleParent])
          .filter(release => (
            fetchIsAwaitingCall(fetches.bundleParentReleases[bundleParent][release])
          ))
          .forEach((release) => {
            newFetches.bundleParentReleases[bundleParent][release].status = FETCH_STATUS.FETCHING;
            NeonApi.getProductObservable(bundleParent).subscribe(
              (response) => {
                dispatch({
                  type: 'fetchBundleParentReleaseSucceeded',
                  bundleParent,
                  release,
                  data: response.data,
                });
              },
              (error) => {
                dispatch({
                  type: 'fetchBundleParentReleaseFailed',
                  bundleParent,
                  release,
                  error,
                });
              },
            );
          });
      });
    // AOP products fetch
    if (fetchIsAwaitingCall(fetches.aopVizProducts)) {
      newFetches.aopVizProducts.status = FETCH_STATUS.FETCHING;
      ajax.getJSON(NeonEnvironment.getVisusProductsBaseUrl()).pipe(
        map((response) => {
          dispatch({ type: 'fetchAOPVizProductsSucceeded', data: response.data });
        }),
        catchError((error) => {
          dispatch({ type: 'fetchAOPVizProductsFailed', error });
          return of('AOP visualization products fetch failed');
        }),
      ).subscribe();
    }
    dispatch({ type: 'fetchesStarted', fetches: newFetches });
  }, [status, productCode, fetches]);

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
const DataProductContext = {
  Provider,
  useDataProductContextState,
  APP_STATUS,
  DEFAULT_STATE,
  getProductCodeAndReleaseFromURL,
  getCurrentProductFromState,
};

export default DataProductContext;
