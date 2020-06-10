export const FETCH_APP_STATE = 'FETCH_APP_STATE';
export const FETCH_APP_STATE_WORKING = 'FETCH_APP_STATE_WORKING';
export const FETCH_APP_STATE_FULLFILLED = 'FETCH_APP_STATE_FULLFILLED';
export const FETCH_APP_STATE_FAILED = 'FETCH_APP_STATE_FAILED';

export const APPLY_SORT = 'APPLY_SORT';
export const APPLY_FILTER = 'APPLY_FILTER';
export const RESET_FILTER = 'RESET_FILTER';
export const RESET_ALL_FILTERS = 'RESET_ALL_FILTERS';

export const EXPAND_FILTER_ITEMS = 'EXPAND_FILTER_ITEMS';
export const COLLAPSE_FILTER_ITEMS = 'COLLAPSE_FILTER_ITEMS';
export const SHOW_SELECTED_FILTER_ITEMS = 'SHOW_SELECTED_FILTER_ITEMS';

export const TOGGLE_SORT_VISIBILITY = 'TOGGLE_SORT_VISIBILITY';
export const TOGGLE_FILTER_VISIBILITY = 'TOGGLE_FILTER_VISIBILITY';
export const TOGGLE_CATALOG_SUMMARY_VISIBILITY = 'TOGGLE_CATALOG_SUMMARY_VISIBILITY';

export const EXPAND_PRODUCT_DESCRIPTION = 'EXPAND_PRODUCT_DESCRIPTION';

export const CHANGE_ACTIVE_DATA_VISUALIZATION = 'CHANGE_ACTIVE_DATA_VISUALIZATION';

export const INCREMENT_SCROLL_CUTOFF = 'INCREMENT_SCROLL_CUTOFF';

/**
 * Fetch state type definitions
 */
export const FetchStateType = {
  WORKING: 'WORKING',
  FULLFILLED: 'FULLFILLED',
  FAILED: 'FAILED',
};

/**
   Fetch Actions
*/
export const fetchAppState = () => ({
  type: FETCH_APP_STATE,
});

export const fetchAppStateWorking = () => ({
  type: FETCH_APP_STATE_WORKING,
});

export const fetchAppStateFullfilled = (products, aopViewerProducts) => ({
  type: FETCH_APP_STATE_FULLFILLED,
  products,
  aopViewerProducts,
});

export const fetchAppStateFailed = (error, response) => ({
  type: FETCH_APP_STATE_FAILED,
  error,
  response,
});

/**
   Sort / Filter Actions
*/
export const applySort = (sortMethod, sortDirection) => ({
  type: APPLY_SORT,
  sortMethod,
  sortDirection,
});

export const applyFilter = (filterKey, filterValue) => ({
  type: APPLY_FILTER,
  filterKey,
  filterValue,
});

export const resetFilter = filterKey => ({
  type: RESET_FILTER,
  filterKey,
});

export const resetAllFilters = () => ({
  type: RESET_ALL_FILTERS,
});

export const expandFilterItems = filterKey => ({
  type: EXPAND_FILTER_ITEMS,
  filterKey,
});

export const collapseFilterItems = filterKey => ({
  type: COLLAPSE_FILTER_ITEMS,
  filterKey,
});

export const showSelectedFilterItems = filterKey => ({
  type: SHOW_SELECTED_FILTER_ITEMS,
  filterKey,
});

export const toggleSortVisibility = () => ({
  type: TOGGLE_SORT_VISIBILITY,
});

export const toggleFilterVisibility = () => ({
  type: TOGGLE_FILTER_VISIBILITY,
});

export const toggleCatalogSummaryVisibility = () => ({
  type: TOGGLE_CATALOG_SUMMARY_VISIBILITY,
});

/**
   Product Actions
*/
export const expandProductDescription = productCode => ({
  type: EXPAND_PRODUCT_DESCRIPTION,
  productCode,
});

/**
   SCROLL CUTOFF ACTIONS
*/
export const incrementScrollCutoff = () => ({
  type: INCREMENT_SCROLL_CUTOFF,  
});

/**
   Data Visualization Component Types and Actions
*/
export const DataVisualizationComponents = {
  AOP: 'AOP',
  TIME_SERIES: 'TIME_SERIES',
};

export const changeActiveDataVisualization = (component = null, productCode = null) => ({
  type: CHANGE_ACTIVE_DATA_VISUALIZATION,
  component,
  productCode,
});
