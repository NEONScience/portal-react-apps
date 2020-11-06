/* eslint-disable import/no-unresolved */
// TODO: figure out why NeonContext raises an import/no-unresolved false positive
// (why that rule is disabled in this file)
import React, { useReducer } from 'react';
import PropTypes from 'prop-types';

import NeonContext from 'portal-core-components/lib/components/NeonContext';

import { AppStatuses, ActionTypes, useActions } from './actions';
import applyMiddleware from './middleware';

const initialState = {
  appStatus: null,
  productCodeToFetch: null,
  product: null,
  bundleParentCodesToFetch: null,
  bundleParents: null,
  bundleForwardAvailabilityFromParent: null,
  error: null,
};

const StoreContext = React.createContext(initialState);

const StoreProvider = (props) => {
  const { children } = props;

  const [{ data: neonContextData }] = NeonContext.useNeonContextState();
  const { bundles } = neonContextData;

  const reducer = (state = {}, action) => {
    let update;
    let bundleParentCodes = null;
    switch (action.type) {
      case ActionTypes.INITIALIZE:
        update = {
          ...state,
          appStatus: AppStatuses.INITIALIZING,
        };
        return update;
      case ActionTypes.STORE_PRODUCT_CODE:
        update = {
          ...state,
          appStatus: AppStatuses.READY_TO_FETCH,
          productCodeToFetch: action.payload.productCode,
        };
        if (bundles.children && bundles.children[action.payload.productCode]) {
          bundleParentCodes = [bundles.children[action.payload.productCode]].flat();
          update.bundleParentCodesToFetch = bundleParentCodes;
          update.bundleForwardAvailabilityFromParent = false;
          if (
            bundleParentCodes.length === 1
              && bundles.parents[bundleParentCodes[0]].forwardAvailability
          ) {
            update.bundleForwardAvailabilityFromParent = true;
          }
        }
        return update;
      case ActionTypes.FETCH_PRODUCT_DATA:
        update = {
          ...state,
          appStatus: AppStatuses.FETCHING,
        };
        return update;
      case ActionTypes.FETCH_PRODUCT_DATA_FULFILLED:
        update = {
          ...state,
          appStatus: AppStatuses.FETCH_SUCCESS,
          product: { ...action.payload.product },
          bundleParents: action.payload.bundleParents ? { ...action.payload.bundleParents } : null,
          error: null,
        };
        // Sort the documents by document number
        update.product.specs.sort((a, b) => (a.specNumber > b.specNumber ? 1 : -1));
        if (update.product.sites && !update.product.siteCodes) {
          update.product.siteCodes = [...update.product.sites];
          delete update.product.sites;
        }
        if (update.bundleParents) {
          // Bundle children come back as "FUTURE" but they're really active by way of the parent.
          update.product.productStatus = 'ACTIVE';
          if (
            Object.keys(update.bundleParents).length === 1
              && update.bundleForwardAvailabilityFromParent
          ) {
            update.product.siteCodes = [
              ...update.bundleParents[Object.keys(update.bundleParents)[0]].siteCodes,
            ];
          }
        }
        return update;
      case ActionTypes.FETCH_PRODUCT_DATA_FAILED:
        update = {
          ...state,
          appStatus: AppStatuses.FETCH_ERROR,
          product: null,
          bundleParent: null,
          error: action.payload.error,
        };
        return update;
      default:
        return state;
    }
  };

  const [state, dispatch] = useReducer(reducer, initialState);

  // Attach middleware to dispatch to create enhancedDispatch
  // enhancedDispatch triggers side effects after reducers complete as defined
  // in middleware.js. Side effects happen on a per-aciton-type basis.
  const enhancedDispatch = applyMiddleware(dispatch);
  const actions = useActions(state, enhancedDispatch);

  const value = { state, enhancedDispatch, actions };
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
};

StoreProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export { StoreContext, StoreProvider };
