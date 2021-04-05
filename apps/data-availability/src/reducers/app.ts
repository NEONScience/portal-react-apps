import AsyncFlow from 'portal-core-components/lib/flow/AsyncFlow';

import AppState from '../store/appState';
import AppActions, {
  SetSelectedProductAction,
  SetSelectedReleaseAction,
  SetSelectedSiteAction,
  SetSelectedViewModeAction,
} from '../actions/app';
import AppFlow from '../actions/flows/app';
import { AppActionType } from '../actions/actionTypes';
import { BaseStoreAppState } from '../types/store';

export const appReducer = (
  state = AppState.getAppState(),
  action: AppActionType,
): BaseStoreAppState => {
  const update: BaseStoreAppState = flowReducer(state, action);
  switch (action.type) {
    case AppActions.SET_SELECTED_VIEW_MODE:
      return {
        ...update,
        selectedViewMode: (action as SetSelectedViewModeAction).viewMode,
        viewModeSwitching: true,
      };
    case AppActions.RESET_VIEW_MODE_SWITCHING:
      return {
        ...update,
        viewModeSwitching: false,
      };
    case AppActions.SET_SELECTED_PRODUCT:
      return {
        ...update,
        selectedProduct: (action as SetSelectedProductAction).product,
      };
    case AppActions.SET_SELECTED_RELEASE:
      return {
        ...update,
        selectedRelease: (action as SetSelectedReleaseAction).release,
      };
    case AppActions.SET_SELECTED_SITE:
      return {
        ...update,
        selectedSite: (action as SetSelectedSiteAction).site,
      };
    default:
      return update;
  }
};

const flowReducer = (
  state = AppState.getAppState(),
  action: AppActionType,
): BaseStoreAppState => {
  let update: BaseStoreAppState = AsyncFlow.reduce<BaseStoreAppState, AppActionType>(
    AppFlow.fetchProducts.reducer,
    state,
    action,
    'productsFetchState',
    AppActions.FETCH_PRODUCTS_COMPLETED,
    'products',
  );
  update = AsyncFlow.reduce<BaseStoreAppState, AppActionType>(
    AppFlow.fetchReleases.reducer,
    update,
    action,
    'releasesFetchState',
    AppActions.FETCH_RELEASES_COMPLETED,
    'releases',
  );
  update = AsyncFlow.reduce<BaseStoreAppState, AppActionType>(
    AppFlow.fetchSites.reducer,
    update,
    action,
    'sitesFetchState',
    AppActions.FETCH_SITES_COMPLETED,
    'sites',
  );
  update = AsyncFlow.reduce<BaseStoreAppState, AppActionType>(
    AppFlow.fetchFocalProduct.reducer,
    update,
    action,
    'focalProductFetchState',
    AppActions.FETCH_FOCAL_PRODUCT_COMPLETED,
    'focalProduct',
  );
  update = AsyncFlow.reduce<BaseStoreAppState, AppActionType>(
    AppFlow.fetchFocalSite.reducer,
    update,
    action,
    'focalSiteFetchState',
    AppActions.FETCH_FOCAL_SITE_COMPLETED,
    'focalSite',
  );
  return update;
};

export default appReducer;
