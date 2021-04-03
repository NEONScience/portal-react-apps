import { createSelector, createSelectorCreator, defaultMemoize } from 'reselect';
import isEqual from 'lodash/isEqual';

import { exists, existsNonEmpty } from 'portal-core-components/lib/util/typeUtil';

import {
  BaseStoreAppState,
  DataProduct,
  Release,
  StoreRootState,
} from '../types/store';
import {
  AppComponentState,
  AvailabilitySectionState,
  DataProductSelectOption,
  DataProductSelectState,
  LocationsSectionState,
} from '../components/states/AppStates';

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
      productsFetchState: state.productsFetchState.asyncState,
      products: state.products,
      releaseFetchState: state.releasesFetchState.asyncState,
      releases: state.releases,
      focalProductFetchState: state.focalProductFetchState.asyncState,
      selectedProduct: state.selectedProduct,
      selectedRelease: state.selectedRelease,
      sitesFetchState: state.sitesFetchState.asyncState,
    }),
  ),
  dataProductSelect: createDeepEqualSelector(
    [appStateSelector],
    (state: BaseStoreAppState): DataProductSelectState => ({
      productsFetchState: state.productsFetchState.asyncState,
      products: !existsNonEmpty(state.products)
        ? new Array<DataProductSelectOption>()
        : state.products.map((value: DataProduct): DataProductSelectOption => {
          if (!exists(state.selectedRelease)) {
            return {
              ...value,
              hasData: existsNonEmpty(value.siteCodes),
            };
          }
          const release: Release = state.selectedRelease as Release;
          const hasData: boolean|undefined = !existsNonEmpty(release.dataProducts)
            ? false
            : release.dataProducts.some((product: DataProduct): boolean => (
              product.productCode === value.productCode
            ));
          return {
            ...value,
            hasData,
          };
        }),
      selectedProduct: state.selectedProduct,
      selectedRelease: state.selectedRelease,
    }),
  ),
  availability: createDeepEqualSelector(
    [appStateSelector],
    (state: BaseStoreAppState): AvailabilitySectionState => ({
      focalProductFetchState: state.focalProductFetchState.asyncState,
      focalProduct: state.focalProduct,
    }),
  ),
  locations: createDeepEqualSelector(
    [appStateSelector],
    (state: BaseStoreAppState): LocationsSectionState => ({
      focalProductFetchState: state.focalProductFetchState.asyncState,
      focalProduct: state.focalProduct,
      sitesFetchState: state.sitesFetchState.asyncState,
      sites: state.sites,
    }),
  ),
};

export default AppStateSelector;
