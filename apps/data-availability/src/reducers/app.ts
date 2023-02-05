import AsyncFlow from 'portal-core-components/lib/flow/AsyncFlow';

import AppState from '../store/appState';
import AppActions, {
  SetReleasesAction,
  SetSelectedProductAction,
  SetSelectedReleaseAction,
  SetSelectedSiteAction,
  SetSelectedViewModeAction,
} from '../actions/app';
import AppFlow from '../actions/flows/app';
import { AnyActionType } from '../actions/actionTypes';
import { BaseStoreAppState, SelectOption } from '../types/store';

export const appReducer = (
  // eslint-disable-next-line @typescript-eslint/default-param-last
  state = AppState.getAppState(),
  action: AnyActionType,
): BaseStoreAppState => {
  const update: BaseStoreAppState = flowReducer(state, action);
  let viewMode: SelectOption;
  switch (action.type) {
    case AppActions.SET_SELECTED_VIEW_MODE:
      viewMode = (action as SetSelectedViewModeAction).viewMode;
      return {
        ...update,
        selectedViewMode: viewMode,
        viewModeSwitching: true,
      };
    case AppActions.RESET_VIEW_MODE_SWITCHING:
      return {
        ...update,
        viewModeSwitching: false,
      };
    case AppActions.SET_RELEASES:
      return {
        ...update,
        releases: (action as SetReleasesAction).releases,
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
    case AppActions.RESET_FOCAL_PRODUCT_RELEASE_DOI:
      return {
        ...update,
        focalProductReleaseDoi: null,
      };
    case AppActions.RESET_FOCAL_PRODUCT_RELEASE_TOMB_AVA:
      return {
        ...update,
        focalProductReleaseTombAva: null,
      };
    default:
      return update;
  }
};

const flowReducer = (
  // eslint-disable-next-line @typescript-eslint/default-param-last
  state = AppState.getAppState(),
  action: AnyActionType,
): BaseStoreAppState => {
  let update: BaseStoreAppState = AsyncFlow.reduce<BaseStoreAppState, AnyActionType>(
    AppFlow.fetchProducts.reducer,
    state,
    action,
    'productsFetchState',
    AppActions.FETCH_PRODUCTS_COMPLETED,
    'products',
  );
  update = AsyncFlow.reduce<BaseStoreAppState, AnyActionType>(
    AppFlow.fetchReleases.reducer,
    update,
    action,
    'releasesFetchState',
    AppActions.FETCH_RELEASES_COMPLETED,
    'releases',
  );
  update = AsyncFlow.reduce<BaseStoreAppState, AnyActionType>(
    AppFlow.fetchSites.reducer,
    update,
    action,
    'sitesFetchState',
    AppActions.FETCH_SITES_COMPLETED,
    'sites',
  );
  update = AsyncFlow.reduce<BaseStoreAppState, AnyActionType>(
    AppFlow.fetchProductBundles.reducer,
    update,
    action,
    'bundlesFetchState',
    AppActions.FETCH_PRODUCT_BUNDLES_COMPLETED,
    'bundles',
  );
  update = AsyncFlow.reduce<BaseStoreAppState, AnyActionType>(
    AppFlow.fetchFocalProduct.reducer,
    update,
    action,
    'focalProductFetchState',
    AppActions.FETCH_FOCAL_PRODUCT_COMPLETED,
    'focalProduct',
  );
  update = AsyncFlow.reduce<BaseStoreAppState, AnyActionType>(
    AppFlow.fetchFocalSite.reducer,
    update,
    action,
    'focalSiteFetchState',
    AppActions.FETCH_FOCAL_SITE_COMPLETED,
    'focalSite',
  );
  update = AsyncFlow.reduce<BaseStoreAppState, AnyActionType>(
    AppFlow.fetchFocalProductReleaseDoi.reducer,
    update,
    action,
    'focalProductReleaseDoiFetchState',
    AppActions.FETCH_FOCAL_PRODUCT_RELEASE_DOI_COMPLETED,
    'focalProductReleaseDoi',
  );
  update = AsyncFlow.reduce<BaseStoreAppState, AnyActionType>(
    AppFlow.fetchFocalProductReleaseTombAva.reducer,
    update,
    action,
    'focalProductReleaseTombAvaFetchState',
    AppActions.FETCH_FOCAL_PRODUCT_RELEASE_TOMB_AVA_COMPLETED,
    'focalProductReleaseTombAva',
  );
  return update;
};

export default appReducer;
