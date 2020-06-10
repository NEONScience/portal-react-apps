export const AppStatuses = {
  INITIALIZING: 'INITIALIZING',
  READY_TO_FETCH: 'READY_TO_FETCH',
  FETCHING: 'FETCHING',
  FETCH_SUCCESS: 'FETCH_SUCCESS',
  FETCH_ERROR: 'FETCH_ERROR',
};

export const ActionTypes = {
  INITIALIZE: 'INITIALIZE',
  STORE_PRODUCT_CODE: 'STORE_PRODUCT_CODE',
  FETCH_PRODUCT_DATA: 'FETCH_PRODUCT_DATA',
  FETCH_PRODUCT_DATA_FULFILLED: 'FETCH_PRODUCT_DATA_FULFILLED',
  FETCH_PRODUCT_DATA_FAILED: 'FETCH_PRODUCT_DATA_FAILED',
};

export const initialize = () => ({
  type: ActionTypes.INITIALIZE,
  payload: {},
});

export const storeProductCode = productCode => ({
  type: ActionTypes.STORE_PRODUCT_CODE,
  payload: { productCode },
});

export const fetchProductData = (productCode, bundleParentCode = null) => ({
  type: ActionTypes.FETCH_PRODUCT_DATA,
  payload: { productCode, bundleParentCode },
});

export const fetchProductDataFulfilled = (product, bundleParent = null) => ({
  type: ActionTypes.FETCH_PRODUCT_DATA_FULFILLED,
  payload: { product, bundleParent },
});

export const fetchProductDataFailed = (error = null) => ({
  type: ActionTypes.FETCH_PRODUCT_DATA_FAILED,
  payload: { error },
});

export const useActions = (state, dispatch) => ({
  initialize: data => dispatch(initialize(data)),
  storeProductCode: data => dispatch(storeProductCode(data)),
  fetchProductData: (productCode, bundleParentCode = null) => {
    dispatch(fetchProductData(productCode, bundleParentCode));
  },
});
