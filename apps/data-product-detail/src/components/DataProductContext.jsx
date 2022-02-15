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

import { useHistory, useLocation } from 'react-router-dom';

import cloneDeep from 'lodash/cloneDeep';

import NeonApi from 'portal-core-components/lib/components/NeonApi';
import NeonContext from 'portal-core-components/lib/components/NeonContext';
import NeonEnvironment from 'portal-core-components/lib/components/NeonEnvironment';
import NeonJsonLd from 'portal-core-components/lib/components/NeonJsonLd';

import BundleService from 'portal-core-components/lib/service/BundleService';

import { exists } from 'portal-core-components/lib/util/typeUtil';

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
      doiProductCode: null,
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
    product: null, // Latest and provisional product metadata
    productReleases: {}, // Product metadata on a per-release basis
    bundleParents: {}, // Latest and provisional bundle parent product metadata
    bundleParentReleases: {}, // Bundle parent product metadata on a per-release basis
    releases: [], // List of release objects; fed from base product or bundle inheritance
    aopVizProducts: [],
  },

  neonContextState: cloneDeep(NeonContext.DEFAULT_STATE),
};

const getProvReleaseRegex = () => new RegExp(/^[A-Z]+$/);

const fetchIsInStatus = (fetchObject, status) => (
  typeof fetchObject === 'object' && fetchObject !== null && fetchObject.status === status
);

const fetchIsAwaitingCall = (fetchObject) => (
  fetchIsInStatus(fetchObject, FETCH_STATUS.AWAITING_CALL)
);

const stateHasFetchesInStatus = (state, status) => (
  fetchIsInStatus(state.fetches.product, status)
  || Object.keys(state.fetches.productReleases).some(
    (f) => fetchIsInStatus(state.fetches.productReleases[f], status),
  )
  || Object.keys(state.fetches.bundleParents).some(
    (f) => fetchIsInStatus(state.fetches.bundleParents[f], status),
  )
  || Object.keys(state.fetches.bundleParentReleases).some(
    (bundleParent) => Object.keys(state.fetches.bundleParentReleases[bundleParent]).some(
      (f) => fetchIsInStatus(state.fetches.bundleParentReleases[bundleParent][f], status),
    ),
  )
  // NOTE: we only care about the aopVizProducts fetch if it's awaiting fetch, so it can be
  // triggered. Otherwise it should never affect app-level status.
  || (
    status === FETCH_STATUS.AWAITING_CALL && fetchIsInStatus(state.fetches.aopVizProducts, status)
  )
);

const getLatestReleaseObjectFromState = (state = DEFAULT_STATE) => {
  const {
    data: { releases },
  } = state;
  const releaseTag = releases && releases.length ? releases[0].release : null;
  return releases.find((r) => r.release === releaseTag) || null;
};

const getCurrentReleaseObjectFromState = (state = DEFAULT_STATE) => {
  const {
    route: { release: currentRelease },
    data: { releases },
  } = state;
  return releases.find((r) => r.release === currentRelease) || null;
};

const calculateFetches = (state) => {
  const newState = { ...state };
  const {
    productCode,
    release: routeRelease,
    bundle: { parentCodes },
  } = state.route;
  const { releases } = state.data;
  if (!productCode) { return state; }
  // Find the latest non-prov release definition
  const latestRelease = (releases && releases.length)
    ? releases.find((r) => {
      const matches = getProvReleaseRegex().exec(r.release);
      const isLatestProv = exists(matches) && (matches.length > 0);
      return !isLatestProv;
    })
    : null;
  const fetchRelease = routeRelease || (latestRelease || {}).release;
  // Fetch the base product
  if (!state.fetches.product) {
    newState.fetches.product = { status: FETCH_STATUS.AWAITING_CALL };
  }
  // Fetch the list of products that support the AOP Visualization
  if (!state.fetches.aopVizProducts) {
    newState.fetches.aopVizProducts = { status: FETCH_STATUS.AWAITING_CALL };
  }
  // Fetch the release-specific product
  if (fetchRelease && !state.fetches.productReleases[fetchRelease]) {
    newState.fetches.productReleases[fetchRelease] = { status: FETCH_STATUS.AWAITING_CALL };
  }
  // Fetch all base bundle parent products
  (parentCodes || []).forEach((bundleParentCode) => {
    if (!newState.fetches.bundleParents[bundleParentCode]) {
      newState.fetches.bundleParents[bundleParentCode] = { status: FETCH_STATUS.AWAITING_CALL };
    }
  });
  // Fetch all release-specific bundle parent products
  if (fetchRelease) {
    (parentCodes || []).forEach((parentCode) => {
      if (!newState.fetches.bundleParentReleases[parentCode]) {
        newState.fetches.bundleParentReleases[parentCode] = {};
      }
      if (!newState.fetches.bundleParentReleases[parentCode][fetchRelease]) {
        newState.fetches.bundleParentReleases[parentCode][fetchRelease] = {
          status: FETCH_STATUS.AWAITING_CALL,
        };
      }
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
  if (stateHasFetchesInStatus(state, FETCH_STATUS.FETCHING) || !state.neonContextState.isFinal) {
    updatedState.app.status = APP_STATUS.FETCHING;
    return updatedState;
  }
  updatedState.app.status = APP_STATUS.READY;
  return updatedState;
};

const sortReleases = (unsortedReleases) => {
  const releases = [...unsortedReleases];
  if (releases && releases.length > 1) {
    releases.sort((a, b) => (a.generationDate < b.generationDate ? 1 : -1));
  }
  return releases;
};

const withContextReleases = (neonContextState) => (
  neonContextState?.auth?.userData?.data?.releases || []
);

const applyUserRelease = (current, userReleases) => {
  if (!Array.isArray(current) || !Array.isArray(userReleases)) {
    return;
  }
  userReleases.forEach((userRelease) => {
    const hasRelease = current.some((value) => (
      (value?.release?.localeCompare(userRelease.releaseTag) === 0) || false
    ));
    if (!hasRelease) {
      current.push({
        ...userRelease,
        showCitation: false,
        showDoi: false,
        showViz: true,
        release: userRelease.releaseTag,
        description: userRelease.description,
        generationDate: userRelease.generationDate
          ? new Date(userRelease.generationDate).toISOString()
          : new Date().toISOString(),
      });
    }
  });
};

// Idempotent function to apply releases to state.data.releases. This is the global lookup for
// all releases applicable to this product. It's separate, and must be populated in this way,
// because the backend currently has no concept of bundles or metadata inheritance. As such a bundle
// child may not show as being in any release though the parent is (if the bundle is one that
// forwards availability). In such a case this will be called when the bundle parent is fetched
// and will thus populate the global releases object (and so the ReleaseFilter).
const applyReleasesGlobally = (state, releases) => {
  const updatedState = { ...state };
  releases
    .filter((r) => (
      !Object.prototype.hasOwnProperty.call(updatedState.data.productReleases, r.release)
    ))
    .forEach((r) => { updatedState.data.productReleases[r.release] = null; });
  releases
    .filter((r) => (
      updatedState.data.releases.every((existingR) => r.release !== existingR.release)
    ))
    .forEach((r) => {
      updatedState.data.releases.push({
        ...r,
        showCitation: true,
        showDoi: true,
        showViz: true,
      });
    });
  return updatedState;
};

const getProductCodeAndReleaseFromURL = (pathname = window.location.pathname) => {
  const base = NeonEnvironment.getRouterBaseHomePath();
  const regex = new RegExp(`${base}\\/(DP[0-9]{1}\\.[0-9]{5}\\.[0-9]{3})\\/?([\\w-]+)?`, 'g');
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
      bundle: { doiProductCode, forwardAvailabilityFromParent },
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
    const firstParentCode = doiProductCode;
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

const getCurrentProductLatestAvailableDate = (state = DEFAULT_STATE, release) => {
  const product = getCurrentProductFromState(state, true);
  if (!product || !Array.isArray(product.siteCodes)) { return null; }
  let latestAvailableMonth = null;
  if (!release) {
    latestAvailableMonth = product.siteCodes
      .reduce((acc, value) => {
        if (!Array.isArray(value.availableMonths) || (value.availableMonths.length <= 0)) {
          return acc;
        }
        const latest = value.availableMonths[value.availableMonths.length - 1];
        if (!acc) { return latest; }
        const compare = acc.localeCompare(latest);
        return (compare > 0)
          ? acc
          : latest;
      }, latestAvailableMonth);
  } else {
    latestAvailableMonth = product.siteCodes
      .reduce((acc, value) => {
        if (!Array.isArray(value.availableMonths) || (value.availableMonths.length <= 0)) {
          return acc;
        }
        if (!Array.isArray(value.availableReleases) || (value.availableReleases.length <= 0)) {
          return acc;
        }
        const matchedRelease = value.availableReleases.find((availRelease) => (
          release.localeCompare(availRelease.release) === 0
        ));
        if (!matchedRelease) { return acc; }
        const latest = matchedRelease.availableMonths[matchedRelease.availableMonths.length - 1];
        if (!acc) { return latest; }
        const compare = acc.localeCompare(latest);
        return (compare > 0)
          ? acc
          : latest;
      }, latestAvailableMonth);
  }
  if (!latestAvailableMonth) {
    return null;
  }
  const date = new Date(latestAvailableMonth);
  return new Date(Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
  )).toISOString();
};

/**
 * Calculates the bundle state for DataProductContext based on the bundle context
 * state stored in NeonContext.
 * @param bundlesCtx The NeonContext bundle state.
 * @param release The release derive bundles for.
 * @param productCode The product code to derive bundles for.
 * @return The new DataProductContext bundle state.
 */
const calculateBundles = (bundlesCtx, release, productCode) => {
  let bundleParentCode = null;
  let bundleParentCodes = [];
  let bundleForwardAvailabilityFromParent = null;
  const bundleRelease = BundleService.determineBundleRelease(release);
  const isBundleChild = BundleService.isProductInBundle(
    bundlesCtx,
    bundleRelease,
    productCode,
  );
  if (isBundleChild) {
    bundleParentCode = BundleService.getBundleProductCode(
      bundlesCtx,
      bundleRelease,
      productCode,
    );
    bundleForwardAvailabilityFromParent = BundleService.shouldForwardAvailability(
      bundlesCtx,
      bundleRelease,
      productCode,
      bundleParentCode,
    );
    const hasManyParents = isBundleChild
      && BundleService.isSplitProduct(bundlesCtx, bundleRelease, productCode);
    if (hasManyParents) {
      bundleParentCodes = BundleService.getSplitProductBundles(
        bundlesCtx,
        bundleRelease,
        productCode,
      );
    } else {
      const bundleCode = BundleService.getBundleProductCode(
        bundlesCtx,
        bundleRelease,
        productCode,
      );
      if (exists(bundleCode)) {
        bundleParentCodes = [bundleCode];
      }
    }
  }
  return {
    parentCodes: bundleParentCodes,
    doiProductCode: bundleParentCode,
    forwardAvailabilityFromParent: bundleForwardAvailabilityFromParent,
  };
};

/**
 * Calculates the current context state based on the NeonContext state,
 * derivation of bundles, and the resulting fetch and app status.
 * @param newState The DataProductContext state to build on.
 * @param neonContextState The new NeonContext state to integrate.
 * @param release The release to work from.
 * @param productCode The product code to work from.
 * @return The next DataProductContext state.
 */
const calculateContextState = (newState, neonContextState, release, productCode) => {
  const isErrorState = (newState.app.status === APP_STATUS.ERROR);
  const routeBundles = calculateBundles(
    neonContextState.data.bundles,
    release,
    productCode,
  );
  const newFetchState = calculateFetches({
    ...newState,
    route: {
      ...newState.route,
      bundle: routeBundles,
    },
  });
  const newAppStatusState = calculateAppStatus({
    ...newFetchState,
    neonContextState,
  });
  // If the existing app state was errored due to initialization,
  // keep the current error state.
  if (isErrorState) {
    newAppStatusState.app.status = APP_STATUS.ERROR;
  }
  return newAppStatusState;
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
    return [cloneDeep(DEFAULT_STATE), () => { }];
  }
  return hookResponse;
};

/**
   REDUCER
*/
const reducer = (state, action) => {
  const newState = { ...state };
  const errorDetail = (
    !action.error ? null
      : ((action.error.response || {}).error || {}).detail || action.error.message || null
  );
  switch (action.type) {
    case 'reinitialize':
      // Reset the context state to default state, but keep the
      // finalized NeonContext state.
      return {
        ...cloneDeep(DEFAULT_STATE),
        neonContextState: state.neonContextState,
      };
    case 'error':
      newState.app.status = APP_STATUS.ERROR;
      newState.app.error = action.error;
      return newState;

    case 'storeFinalizedNeonContextState':
      applyUserRelease(newState.data.releases, withContextReleases(action.neonContextState));
      return calculateContextState(
        newState,
        action.neonContextState,
        newState.route.release,
        newState.route.productCode,
      );

    // Route parsing from initialization only.
    // See 'setNextRelease' when route changes with respect to release after initialization
    case 'parseRoute':
      // Fill in state.route from action
      newState.route.productCode = action.productCode;
      newState.route.release = action.release;
      return newState;

    case 'fetchProductStarted':
      newState.fetches.product.status = FETCH_STATUS.FETCHING;
      return calculateAppStatus(newState);
    case 'fetchProductFailed':
      newState.fetches.product.status = FETCH_STATUS.ERROR;
      newState.fetches.product.error = action.error;
      newState.app.error = `${errorDetail}: product code ${state.route.productCode}`;
      return calculateAppStatus(newState);
    case 'fetchProductSucceeded':
      newState.fetches.product.status = FETCH_STATUS.SUCCESS;
      newState.data.product = action.data;
      newState.data.product.releases = sortReleases(newState.data.product.releases);
      return calculateAppStatus(
        calculateFetches(
          applyReleasesGlobally(newState, newState.data.product.releases),
        ),
      );

    case 'fetchProductReleaseStarted':
      newState.fetches.productReleases[action.release].status = FETCH_STATUS.FETCHING;
      return calculateAppStatus(newState);
    case 'fetchProductReleaseFailed':
      newState.fetches.productReleases[action.release].status = FETCH_STATUS.ERROR;
      newState.fetches.productReleases[action.release].error = action.error;
      // eslint-disable-next-line max-len
      newState.app.error = `${errorDetail}: ${action.release}`;
      return calculateAppStatus(newState);
    case 'fetchProductReleaseSucceeded':
      newState.fetches.productReleases[action.release].status = FETCH_STATUS.SUCCESS;
      newState.data.productReleases[action.release] = action.data;
      return calculateAppStatus(newState);

    case 'fetchBundleParentStarted':
      newState.fetches.bundleParents[action.bundleParent].status = FETCH_STATUS.FETCHING;
      return calculateAppStatus(newState);
    case 'fetchBundleParentFailed':
      newState.fetches.bundleParents[action.bundleParent].status = FETCH_STATUS.ERROR;
      newState.fetches.bundleParents[action.bundleParent].error = action.error;
      newState.app.error = `${errorDetail}: bundle parent product code ${action.bundleParent}`;
      return calculateAppStatus(newState);
    case 'fetchBundleParentSucceeded':
      newState.fetches.bundleParents[action.bundleParent].status = FETCH_STATUS.SUCCESS;
      newState.data.bundleParents[action.bundleParent] = action.data;
      // eslint-disable-next-line max-len
      newState.data.bundleParents[action.bundleParent].releases = sortReleases(action.data.releases);
      return calculateAppStatus(
        calculateFetches(
          // eslint-disable-next-line max-len
          applyReleasesGlobally(newState, newState.data.bundleParents[action.bundleParent].releases),
        ),
      );

    case 'fetchBundleParentReleaseStarted':
      /* eslint-disable max-len */
      newState.fetches.bundleParentReleases[action.bundleParent][action.release].status = FETCH_STATUS.FETCHING;
      /* eslint-enable max-len */
      return calculateAppStatus(newState);
    case 'fetchBundleParentReleaseFailed':
      /* eslint-disable max-len */
      newState.fetches.bundleParentReleases[action.bundleParent][action.release].status = FETCH_STATUS.ERROR;
      newState.fetches.bundleParentReleases[action.bundleParent][action.release].error = action.error;
      newState.app.error = `${errorDetail}: bundle parent product code ${action.bundleParent}; release ${action.release}`;
      /* eslint-enable max-len */
      return calculateAppStatus(newState);
    case 'fetchBundleParentReleaseSucceeded':
      // eslint-disable-next-line max-len
      newState.fetches.bundleParentReleases[action.bundleParent][action.release].status = FETCH_STATUS.SUCCESS;
      if (!newState.data.bundleParentReleases[action.bundleParent]) {
        newState.data.bundleParentReleases[action.bundleParent] = {};
      }
      newState.data.bundleParentReleases[action.bundleParent][action.release] = action.data;
      return calculateAppStatus(newState);

    case 'fetchAOPVizProductsStarted':
      newState.fetches.aopVizProducts.status = FETCH_STATUS.FETCHING;
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
      return calculateContextState(
        newState,
        newState.neonContextState,
        newState.route.release,
        newState.route.productCode,
      );

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
    app: { status },
    route: {
      productCode,
      release: currentRelease,
      nextRelease,
      nextHash,
    },
    fetches,
    neonContextState: {
      isFinal: neonContextIsFinal,
    },
  } = state;

  /**
     Effects
  */
  // Parse productCode and release out of the route (URL).
  useEffect(() => {
    if (status !== APP_STATUS.INITIALIZING) { return; }
    const [routeProductCode, routeRelease] = getProductCodeAndReleaseFromURL();
    if (!routeProductCode) {
      dispatch({ type: 'error', error: 'Data product not found' });
      return;
    }
    dispatch({
      type: 'parseRoute',
      productCode: routeProductCode,
      release: routeRelease,
    });
  }, [status]);

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
    // Next release differs from location: navigate to next release and apply to state
    if (nextRelease !== undefined && nextRelease !== locationRelease) {
      const baseRoute = NeonEnvironment.getRouterBaseHomePath();
      let nextLocation = nextRelease === null
        ? `${baseRoute}/${productCode}`
        : `${baseRoute}/${productCode}/${nextRelease}`;
      if (nextHash) { nextLocation = `${nextLocation}#${nextHash}`; }
      history.push(nextLocation);
      NeonJsonLd.injectProduct(productCode, nextRelease);
      dispatch({ type: 'applyNextRelease' });
      return;
    }
    // Next release diffres from current: apply next release to state (used after browser nav)
    if (nextRelease !== undefined && nextRelease !== currentRelease) {
      dispatch({ type: 'applyNextRelease' });
      return;
    }
    // Location differs from current release: set the location as the next release
    if (locationRelease !== currentRelease) {
      dispatch({ type: 'setNextRelease', release: locationRelease });
    }
  }, [status, history, pathname, productCode, currentRelease, nextRelease, nextHash]);

  // Trigger any fetches that are awaiting call
  useEffect(() => {
    // NeonContext is required to fetch data for the app due to bundles.
    if (!neonContextIsFinal) { return; }
    if (status !== APP_STATUS.HAS_FETCHES_TO_TRIGGER) { return; }
    // Base product fetch
    if (fetchIsAwaitingCall(fetches.product)) {
      dispatch({ type: 'fetchProductStarted' });
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
      .filter((release) => fetchIsAwaitingCall(fetches.productReleases[release]))
      .forEach((release) => {
        dispatch({ type: 'fetchProductReleaseStarted', release });
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
      .filter((bundleParent) => fetchIsAwaitingCall(fetches.bundleParents[bundleParent]))
      .forEach((bundleParent) => {
        dispatch({ type: 'fetchBundleParentStarted', bundleParent });
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
          .filter((release) => (
            fetchIsAwaitingCall(fetches.bundleParentReleases[bundleParent][release])
          ))
          .forEach((release) => {
            dispatch({ type: 'fetchBundleParentReleaseStarted', bundleParent, release });
            NeonApi.getProductObservable(bundleParent, release).subscribe(
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
      dispatch({ type: 'fetchAOPVizProductsStarted' });
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
  }, [status, productCode, fetches, neonContextIsFinal]);

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
  getCurrentProductLatestAvailableDate,
  getCurrentReleaseObjectFromState,
  getLatestReleaseObjectFromState,
};

export default DataProductContext;
