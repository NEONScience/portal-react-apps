import {
  applySort,
  applyFilter,
  resetFilter,
  resetAllFilters,
  changeFilterItemVisibility,
  FILTER_ITEM_VISIBILITY_STATES,
} from "../util/filterUtil";

import { buildAppState } from "../util/appUtil";

import {
  FetchStateType,
  FETCH_APP_STATE,
  FETCH_APP_STATE_WORKING,
  FETCH_APP_STATE_FULLFILLED,
  FETCH_APP_STATE_FAILED,
  APPLY_SORT,
  APPLY_FILTER,
  RESET_FILTER,
  RESET_ALL_FILTERS,
  EXPAND_FILTER_ITEMS,
  COLLAPSE_FILTER_ITEMS,
  SHOW_SELECTED_FILTER_ITEMS,
  TOGGLE_SORT_VISIBILITY,
  TOGGLE_FILTER_VISIBILITY,
  TOGGLE_CATALOG_SUMMARY_VISIBILITY,
  EXPAND_PRODUCT_DESCRIPTION,
  INCREMENT_SCROLL_CUTOFF,
  DataVisualizationComponents,
  CHANGE_ACTIVE_DATA_VISUALIZATION,
} from "../actions/actions";

const reducer = (state = {}, action) => {
  let update;
  switch (action.type) {
    case FETCH_APP_STATE:
      return state;
    case FETCH_APP_STATE_WORKING:
      return { ...state, appFetchState: FetchStateType.WORKING };
    case FETCH_APP_STATE_FULLFILLED:
      try {
        update = buildAppState(state, action);
      } catch (error) {
        console.error("Failed to build app state", error);
        update = {
          ...state,
          appFetchState: FetchStateType.FAILED
        };
      }
      return update;
    case FETCH_APP_STATE_FAILED:
      return { ...state, appFetchState: FetchStateType.FAILED };

    case APPLY_SORT:
      return applySort(state, action.sortMethod, action.sortDirection);
    case APPLY_FILTER:
      return applyFilter(state, action.filterKey, action.filterValue);
    case RESET_FILTER:
      return resetFilter(state, action.filterKey);
    case RESET_ALL_FILTERS:
      return resetAllFilters(state);

    case EXPAND_FILTER_ITEMS:
      return changeFilterItemVisibility(state, action.filterKey, FILTER_ITEM_VISIBILITY_STATES.EXPANDED);
    case COLLAPSE_FILTER_ITEMS:
      return changeFilterItemVisibility(state, action.filterKey, FILTER_ITEM_VISIBILITY_STATES.COLLAPSED);
    case SHOW_SELECTED_FILTER_ITEMS:
      return changeFilterItemVisibility(state, action.filterKey, FILTER_ITEM_VISIBILITY_STATES.SELECTED);

    case TOGGLE_SORT_VISIBILITY:
      return { ...state, sortVisible: !state.sortVisible };
    case TOGGLE_FILTER_VISIBILITY:
      return { ...state, filtersVisible: !state.filtersVisible };
    case TOGGLE_CATALOG_SUMMARY_VISIBILITY:
      return { ...state, catalogSummaryVisible: !state.catalogSummaryVisible };

    case EXPAND_PRODUCT_DESCRIPTION:
      if (!Object.keys(state.productDescriptionExpanded).includes(action.productCode)) {
        return state;
      }
      return {
        ...state,
        productDescriptionExpanded: {
          ...state.productDescriptionExpanded,
          [action.productCode]: true,
        }
      };

    case CHANGE_ACTIVE_DATA_VISUALIZATION:
      if (
        (action.component === null && action.productCode === null)
        || !DataVisualizationComponents[action.component] || !state.products[action.productCode]
      ) {
        return {
          ...state,
          activeDataVisualization: { component: null, productCode: null },
        };
      }
      return {
        ...state,
        activeDataVisualization: {
          component: action.component,
          productCode: action.productCode,
        },
      };

    case INCREMENT_SCROLL_CUTOFF:
      return {
        ...state,
        scrollCutoff: state.scrollCutoff + 10,
      };

    default:
      return state;
  }
};

export default reducer;
