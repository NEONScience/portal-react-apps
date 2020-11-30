import {
  applySort,
  applyFilter,
  resetFilter,
  resetAllFilters,
  changeFilterItemVisibility,
  updateProductVisibilityToCurrentRelease,
  FILTER_ITEM_VISIBILITY_STATES,
} from "../util/filterUtil";

import { buildAppState } from "../util/appUtil";

import {
  BuildStateType,
  FetchStateType,
  FETCH_APP_STATE,
  FETCH_APP_STATE_WORKING,
  FETCH_APP_STATE_COMPLETE,
  FETCH_APP_STATE_FAILED,
  CHANGE_NEON_CONTEXT_STATE,
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
  CHANGE_RELEASE,
} from "../actions/actions";

const buildAppStateIfReady = (state) => {
  // We only want to build once when we know that the following is all true:
  // 1. The build state is AWAITING_DATA
  // 2. The app fetches are no longer in progress (not WORKING)
  // 3. The NeonContext is both active and final
  // This all means that all the data is either present or failed (but NOT still working) and we
  // haven't yet built the app state.
  if (
    ! (
      state.appBuildState === BuildStateType.AWAITING_DATA
        && state.appFetchState !== FetchStateType.WORKING
        && state.neonContextState.isActive && state.neonContextState.isFinal
    )
  ) { return state; }
  if (state.appFetchState !== FetchStateType.COMPLETE || state.neonContextState.hasError) {
    return { ...state, appBuildState: BuildStateType.FAILED };
  }
  let update;
  try {
    update = buildAppState(state);
    update.appBuildState = BuildStateType.COMPLETE;
  } catch (error) {
    console.error("Failed to build app state", error);
    update = { ...state, appBuildState: BuildStateType.FAILED };
  }
  return update;
};

const reducer = (state = {}, action) => {
  switch (action.type) {
    case FETCH_APP_STATE:
      return state;
    case FETCH_APP_STATE_WORKING:
      return { ...state, appFetchState: FetchStateType.WORKING };
    case FETCH_APP_STATE_COMPLETE:
      return buildAppStateIfReady({
        ...state,
        appFetchState: FetchStateType.COMPLETE,
        aopViewerProducts: action.aopViewerProducts || [],
        fetchedProducts: action.products || [],
      });
    case FETCH_APP_STATE_FAILED:
      return { ...state, appFetchState: BuildStateType.FAILED };

    case CHANGE_NEON_CONTEXT_STATE:
      return buildAppStateIfReady({
        ...state,
        neonContextState: action.neonContextState,
      });

    case APPLY_SORT:
      return applySort(state, action.sortMethod, action.sortDirection);
    case APPLY_FILTER:
      if (action.showOnlySelected) { 
        return changeFilterItemVisibility(
          applyFilter(state, action.filterKey, action.filterValue),
          action.filterKey,
          FILTER_ITEM_VISIBILITY_STATES.SELECTED,
        );
      }
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

    case CHANGE_RELEASE:
      if (action.release !== null && !state.releases.find(r => r.release === action.release)) {
        return state;
      }
      return updateProductVisibilityToCurrentRelease({
        ...state,
        currentRelease: action.release,
      });

    default:
      return state;
  }
};

export default reducer;
