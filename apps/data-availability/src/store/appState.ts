import { AsyncStateType } from 'portal-core-components/lib/types/asyncFlow';

import { BaseStoreAppState } from '../types/store';

const VIEW_MODES = [
  { value: 'DataProduct', title: 'Data Product' },
  { value: 'Site', title: 'Site' },
];

const appState: BaseStoreAppState = {
  productsFetchState: {
    asyncState: AsyncStateType.IDLE,
    data: [],
    error: null,
  },
  products: [],
  sitesFetchState: {
    asyncState: AsyncStateType.IDLE,
    data: [],
    error: null,
  },
  sites: [],
  releasesFetchState: {
    asyncState: AsyncStateType.IDLE,
    data: [],
    error: null,
  },
  releases: [],
  bundlesFetchState: {
    asyncState: AsyncStateType.IDLE,
    data: [],
    error: null,
  },
  bundles: {},

  focalProductFetchState: {
    asyncState: AsyncStateType.IDLE,
    data: null,
    error: null,
  },
  focalProduct: null,
  focalSiteFetchState: {
    asyncState: AsyncStateType.IDLE,
    data: null,
    error: null,
  },
  focalSite: null,

  focalProductReleaseDoiFetchState: {
    asyncState: AsyncStateType.IDLE,
    data: null,
    error: null,
  },
  focalProductReleaseDoi: null,
  focalProductReleaseTombAvaFetchState: {
    asyncState: AsyncStateType.IDLE,
    data: null,
    error: null,
  },
  focalProductReleaseTombAva: null,

  selectedRelease: null,
  selectedProduct: null,
  selectedSite: null,

  selectedViewMode: VIEW_MODES[0],
  viewModes: VIEW_MODES,
  viewModeSwitching: false,
};

const getAppState = (): BaseStoreAppState => (
  { ...appState }
);

const AppState = {
  getAppState,
};

export default AppState;
