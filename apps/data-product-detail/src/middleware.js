import { of, forkJoin } from 'rxjs';
import { mergeMap, catchError } from 'rxjs/operators';

import NeonApi from 'portal-core-components/lib/components/NeonApi';

import {
  ActionTypes,
  storeProductCode,
  fetchProductDataFulfilled,
  fetchProductDataFailed,
} from './actions';

export const getProductCode = () => {
  const parse = /data-products\/(DP[0-9]{1}\.[0-9]{5}\.[0-9]{3})/g.exec(window.location.pathname);
  return parse === null ? null : parse[1];
};

const buildFetchObservable = (productCode, bundleParentCode = null) => {
  const getAJAX = code => NeonApi.getProductObservable(code);
  const requests = [getAJAX(productCode)];
  const requestMap = { product: 0 };
  if (bundleParentCode) {
    requests.push(getAJAX(bundleParentCode));
    requestMap.bundleParent = 1;
  }
  const mergeResponses = mergeMap((response) => {
    // Handle product
    let product = null;
    if (!response[requestMap.product] || !response[requestMap.product].data) {
      return of(fetchProductDataFailed('invalid product API response'));
    }
    product = response[requestMap.product].data || null;
    // Handle bundleParent
    let bundleParent = null;
    if (requestMap.bundleParent) {
      if (!response[requestMap.bundleParent] || !response[requestMap.bundleParent].data) {
        return of(fetchProductDataFailed('invalid bundle parent API response'));
      }
      bundleParent = response[requestMap.bundleParent].data || null;
    }
    // Done
    return of(fetchProductDataFulfilled(product, bundleParent));
  });
  const handleError = catchError((error) => {
    let message = null;
    if (!error.status || ![400, 404].includes(error.status)) {
      message = error.message ? error.message : 'request failed';
    }
    return of(fetchProductDataFailed(message));
  });
  return forkJoin(requests).pipe(mergeResponses, handleError);
};

const applyMiddleware = dispatch => (action) => {
  let productCode = null;
  switch (action.type) {
    case ActionTypes.INITIALIZE:
      productCode = getProductCode();
      return dispatch(storeProductCode(productCode));

    case ActionTypes.FETCH_PRODUCT_DATA:
      return buildFetchObservable(action.payload.productCode, action.payload.bundleParentCode)
        .subscribe(responseAction => dispatch(responseAction));

    default:
      return dispatch(action);
  }
};

export default applyMiddleware;
