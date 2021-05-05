import { AsyncStateType } from 'portal-core-components/lib/types/asyncFlow';

import { BaseStoreAppState } from '../types/store';

const appState: BaseStoreAppState = {
  productsFetchState: {
    asyncState: AsyncStateType.IDLE,
    data: [],
    error: null,
  },
  products: [],
};

const getAppState = (): BaseStoreAppState => (
  { ...appState }
);

const AppState = {
  getAppState,
};

export default AppState;
