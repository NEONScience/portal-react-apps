import { AsyncStateType } from 'portal-core-components/lib/types/asyncFlow';

import { BaseStoreAppState } from '../types/store';

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
};

const getAppState = (): BaseStoreAppState => (
  { ...appState }
);

const AppState = {
  getAppState,
};

export default AppState;
