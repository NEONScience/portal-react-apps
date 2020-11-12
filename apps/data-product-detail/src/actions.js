export const AppStatuses = {
  INITIALIZING: 'INITIALIZING',
  READY_TO_FETCH: 'READY_TO_FETCH',
  FETCHING: 'FETCHING',
  FETCH_SUCCESS: 'FETCH_SUCCESS',
  FETCH_ERROR: 'FETCH_ERROR',
};

export const ActionTypes = {
  INITIALIZE: 'INITIALIZE',
  STORE_PRODUCT_CODE: 'STORE_PRODUCT_CODE_AND_CURRENT_RELEASE',
  FETCH_PRODUCT_DATA: 'FETCH_PRODUCT_DATA',
  FETCH_PRODUCT_DATA_FULFILLED: 'FETCH_PRODUCT_DATA_FULFILLED',
  FETCH_PRODUCT_DATA_FAILED: 'FETCH_PRODUCT_DATA_FAILED',
  SET_RELEASE: 'SET_RELEASE',
};

export const initialize = () => ({
  type: ActionTypes.INITIALIZE,
  payload: {},
});

export const storeProductCodeAndCurrentRelease = (productCode, currentRelease = null) => ({
  type: ActionTypes.STORE_PRODUCT_CODE_AND_CURRENT_RELEASE,
  payload: { productCode, currentRelease },
});

export const fetchProductData = (productCode, bundleParentCodes = []) => ({
  type: ActionTypes.FETCH_PRODUCT_DATA,
  payload: { productCode, bundleParentCodes },
});

export const fetchProductDataFulfilled = (product, bundleParents = null) => ({
  type: ActionTypes.FETCH_PRODUCT_DATA_FULFILLED,
  payload: { product, bundleParents },
});

export const fetchProductDataFailed = (error = null) => ({
  type: ActionTypes.FETCH_PRODUCT_DATA_FAILED,
  payload: { error },
});

export const setRelease = (release = '') => ({
  type: ActionTypes.SET_RELEASE,
  payload: { release },
});

export const useActions = (state, dispatch) => ({
  initialize: (data) => {
    dispatch(initialize(data));
  },
  storeProductCodeAndCurrentRelease: (productCode, currentRelease = null) => {
    dispatch(storeProductCodeAndCurrentRelease(productCode, currentRelease));
  },
  fetchProductData: (productCode, bundleParentCodes = []) => {
    dispatch(fetchProductData(productCode, bundleParentCodes));
  },
  setRelease: (release) => {
    dispatch(setRelease(release));
  },
});
