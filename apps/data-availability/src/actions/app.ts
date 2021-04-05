import { Nullable } from 'portal-core-components/lib/types/core';
import {
  DataProduct,
  Release,
  SelectOption,
  Site,
} from '../types/store';

enum AppActions {
  FETCH_PRODUCTS = 'FETCH_PRODUCTS',
  FETCH_PRODUCTS_WORKING = 'FETCH_PRODUCTS_WORKING',
  FETCH_PRODUCTS_COMPLETED = 'FETCH_PRODUCTS_COMPLETED',
  FETCH_PRODUCTS_ERROR = 'FETCH_PRODUCTS_ERROR',
  RESET_FETCH_PRODUCTS = 'RESET_FETCH_PRODUCTS',

  FETCH_SITES = 'FETCH_SITES',
  FETCH_SITES_WORKING = 'FETCH_SITES_WORKING',
  FETCH_SITES_COMPLETED = 'FETCH_SITES_COMPLETED',
  FETCH_SITES_ERROR = 'FETCH_SITES_ERROR',
  RESET_FETCH_SITES = 'RESET_FETCH_SITES',

  FETCH_RELEASES = 'FETCH_RELEASES',
  FETCH_RELEASES_WORKING = 'FETCH_RELEASES_WORKING',
  FETCH_RELEASES_COMPLETED = 'FETCH_RELEASES_COMPLETED',
  FETCH_RELEASES_ERROR = 'FETCH_RELEASES_ERROR',
  RESET_FETCH_RELEASES = 'RESET_FETCH_RELEASES',

  FETCH_FOCAL_PRODUCT = 'FETCH_FOCAL_PRODUCT',
  FETCH_FOCAL_PRODUCT_WORKING = 'FETCH_FOCAL_PRODUCT_WORKING',
  FETCH_FOCAL_PRODUCT_COMPLETED = 'FETCH_FOCAL_PRODUCT_COMPLETED',
  FETCH_FOCAL_PRODUCT_ERROR = 'FETCH_FOCAL_PRODUCT_ERROR',
  RESET_FETCH_FOCAL_PRODUCT = 'RESET_FETCH_FOCAL_PRODUCT',

  FETCH_FOCAL_SITE = 'FETCH_FOCAL_SITE',
  FETCH_FOCAL_SITE_WORKING = 'FETCH_FOCAL_SITE_WORKING',
  FETCH_FOCAL_SITE_COMPLETED = 'FETCH_FOCAL_SITE_COMPLETED',
  FETCH_FOCAL_SITE_ERROR = 'FETCH_FOCAL_SITE_ERROR',
  RESET_FETCH_FOCAL_SITE = 'RESET_FETCH_FOCAL_SITE',

  SET_SELECTED_VIEW_MODE = 'SET_SELECTED_VIEW_MODE',
  SET_SELECTED_PRODUCT = 'SET_SELECTED_PRODUCT',
  SET_SELECTED_RELEASE = 'SET_SELECTED_RELEASE',
  SET_SELECTED_SITE = 'SET_SELECTED_SITE',

  RESET_VIEW_MODE_SWITCHING = 'RESET_VIEW_MODE_SWITCHING',
}

export interface SetSelectedViewModeAction {
  type: typeof AppActions.SET_SELECTED_VIEW_MODE;
  viewMode: SelectOption;
}
export interface ResetViewModeSwitchingAction {
  type: typeof AppActions.RESET_VIEW_MODE_SWITCHING;
}
export interface SetSelectedProductAction {
  type: typeof AppActions.SET_SELECTED_PRODUCT;
  product: DataProduct;
}
export interface SetSelectedReleaseAction {
  type: typeof AppActions.SET_SELECTED_RELEASE;
  release: Nullable<Release>;
}
export interface SetSelectedSiteAction {
  type: typeof AppActions.SET_SELECTED_SITE;
  site: Site;
}

export type AppActionTypes = (
  SetSelectedViewModeAction
  | ResetViewModeSwitchingAction
  | SetSelectedProductAction
  | SetSelectedReleaseAction
  | SetSelectedSiteAction
);

export const AppActionCreator = {
  resetViewModeSwitching: (): ResetViewModeSwitchingAction => ({
    type: AppActions.RESET_VIEW_MODE_SWITCHING,
  }),
  setSelectedViewMode: (viewMode: SelectOption): SetSelectedViewModeAction => ({
    type: AppActions.SET_SELECTED_VIEW_MODE,
    viewMode,
  }),
  setSelectedProduct: (product: DataProduct): SetSelectedProductAction => ({
    type: AppActions.SET_SELECTED_PRODUCT,
    product,
  }),
  setSelectedRelease: (release: Nullable<Release>): SetSelectedReleaseAction => ({
    type: AppActions.SET_SELECTED_RELEASE,
    release,
  }),
  setSelectedSite: (site: Site): SetSelectedSiteAction => ({
    type: AppActions.SET_SELECTED_SITE,
    site,
  }),
};

export default AppActions;
