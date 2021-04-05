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
