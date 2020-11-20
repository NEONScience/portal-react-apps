/* eslint-disable import/no-unresolved, no-unused-vars */
import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
} from 'react';
import PropTypes from 'prop-types';

import cloneDeep from 'lodash/cloneDeep';

import NeonApi from 'portal-core-components/lib/components/NeonApi';
import NeonContext from 'portal-core-components/lib/components/NeonContext';

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
  },
  fetches: {
    product: null,
    productReleases: {},
    bundleParents: {},
    bundleParentReleases: {},
  },
  data: {
    product: null,
    productReleases: {},
    bundleParents: {},
    bundleParentReleases: {},
  },
  /*
  appStatus: null,
  productCodeToFetch: null,
  product: null,
  bundleParentCodesToFetch: null,
  bundleParents: null,
  bundleForwardAvailabilityFromParent: null,
  error: null,
  releases: [
    { name: 'NEON.2021.0', doi: 'https://doi.org/abc/def_ghi_jkl_mnopqrstu' },
    { name: 'NEON.2021.1', doi: 'https://doi.org/abc/jkl_mno_pqr_stuvwx/yzabcdef' },
    { name: 'NEON.2021.2', doi: 'https://doi.org/abc/psr_stu_vwxyz_abcdef' },
    { name: 'NEON.2022.0', doi: 'https://doi.org/abc/vwx_yza_bcd_efghijklmnop' },
  ],
  currentRelease: null,
  */
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
);

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
    // See 'setRelease' when route changes with respect to release after initialization
    case 'parseRoute':
      // Fill in state.route from action
      newState.route.productCode = action.productCode;
      newState.route.release = action.release;
      if (action.bundleParentCodes) {
        newState.route.bundle.parentCodes = action.bundleParentCodes;
        // eslint-disable-next-line max-len
        newState.route.bundle.forwardAvailabilityFromParent = action.bundleForwardAvailabilityFromParent;
      }
      // Generate fetches from updated state.route
      newState.fetches.product = { status: FETCH_STATUS.AWAITING_CALL };
      if (newState.route.release) {
        newState.fetches.productReleases[newState.route.release] = {
          status: FETCH_STATUS.AWAITING_CALL,
        };
      }
      (newState.route.bundle.parentCodes || []).forEach((bundleParentCode) => {
        newState.fetches.bundleParents[bundleParentCode] = { status: FETCH_STATUS.AWAITING_CALL };
      });
      if (action.bundleForwardAvailabilityFromParent) {
        state.route.bundle.parentCodes.forEach((parentCode) => {
          newState.fetches.bundleParentReleases[parentCode] = {};
          if (action.release) {
            newState.fetches.bundleParentReleases[parentCode][action.release] = {
              status: FETCH_STATUS.AWAITING_CALL,
            };
          }
        });
      }
      // Set app status and return
      return calculateAppStatus(newState);

    case 'fetchesStarted':
      newState.fetches = { ...action.fetches };
      newState.app.status = APP_STATUS.FETCHING;
      return newState;

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
      return newState;
    case 'fetchProductReleaseSucceeded':
      newState.fetches.productReleases[action.release].status = FETCH_STATUS.SUCCESS;
      newState.data.productReleases[action.release] = action.data;
      return calculateAppStatus(newState);

    case 'fetchBundleParentFailed':
      newState.fetches.bundleParents[action.bundleParent].status = FETCH_STATUS.ERROR;
      newState.fetches.bundleParents[action.bundleParent].error = action.error;
      // eslint-disable-next-line max-len
      newState.app.error = `Fetching bundle parent product ${action.bundleParent} failed: ${action.error.message}`;
      return newState;
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
      return newState;
    case 'fetchBundleParentReleaseSucceeded':
      // eslint-disable-next-line max-len
      newState.fetches.bundleParents[action.bundleParent][action.release].status = FETCH_STATUS.SUCCESS;
      newState.data.bundleParents[action.bundleParent][action.release] = action.data;
      return calculateAppStatus(newState);

    // Change the current release route from an already initialized state (from DataProductRouter)
    case 'setRelease':
      if (action.release === null || action.release === 'n/a') {
        newState.route.release = null;
        return newState;
      }
      if (!Object.prototype.hasOwnProperty.call(state.data.productReleases, action.release)) {
        return state;
      }
      newState.route.release = action.release;
      if (!state.fetches.productReleases[action.release]) {
        newState.fetches.productReleases[action.release] = { status: FETCH_STATUS.AWAITING_CALL };
      }
      if (state.route.bundle.forwardAvailabilityFromParent) {
        state.route.bundle.parentCodes.forEach((parentCode) => {
          if (!state.fetches.bundleParentReleases[parentCode][action.release]) {
            newState.fetches.bundleParentReleases[parentCode][action.release] = {
              status: FETCH_STATUS.AWAITING_CALL,
            };
          }
        });
      }
      return calculateAppStatus(newState);

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
    route: { productCode },
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
