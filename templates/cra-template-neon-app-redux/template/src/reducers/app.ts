import AsyncFlow from 'portal-core-components/lib/flow/AsyncFlow';

import AppState from '../store/appState';
import AppActions from '../actions/app';
import AppFlow from '../actions/flows/app';
import { AppActionType } from '../actions/actionTypes';
import { BaseStoreAppState } from '../types/store';

export const appReducer = (
  state = AppState.getAppState(),
  action: AppActionType,
): BaseStoreAppState => (
  flowReducer(state, action)
);

const flowReducer = (
  state = AppState.getAppState(),
  action: AppActionType,
): BaseStoreAppState => {
  const update: BaseStoreAppState = AsyncFlow.reduce<BaseStoreAppState, AppActionType>(
    AppFlow.fetchProducts.reducer,
    state,
    action,
    'productsFetchState',
    AppActions.FETCH_PRODUCTS_COMPLETED,
    'products',
  );
  return update;
};

export default appReducer;
