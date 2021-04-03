import { createSelector, createSelectorCreator, defaultMemoize } from 'reselect';

import isEqual from 'lodash/isEqual';
import { BaseStoreAppState, StoreRootState } from '../types/store';
import { AppComponentState } from '../components/states/AppStates';

const appState = (state: StoreRootState): BaseStoreAppState => (
  state.app
);

const appStateSelector = createSelector(
  [appState],
  (state: BaseStoreAppState): BaseStoreAppState => state,
);

const createDeepEqualSelector = createSelectorCreator(
  defaultMemoize,
  isEqual,
);

const AppStateSelector = {
  app: createDeepEqualSelector(
    [appStateSelector],
    (state: BaseStoreAppState): AppComponentState => ({
      productFetchState: state.productsFetchState.asyncState,
      products: state.products,
    }),
  ),
};

export default AppStateSelector;
