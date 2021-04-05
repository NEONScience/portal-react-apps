import {
  createSelector,
  createSelectorCreator,
  defaultMemoize,
} from 'reselect';
import isEqual from 'lodash/isEqual';

import { exists, existsNonEmpty } from 'portal-core-components/lib/util/typeUtil';

import {
  BaseStoreAppState,
  DataProduct,
  Release,
  StoreRootState,
  Site,
} from '../types/store';
import {
  AppComponentState,
  AvailabilitySectionState,
  DataProductSelectOption,
  DataProductSelectState,
  LocationsSectionState,
  SiteAvailabilitySectionState,
  SiteSelectOption,
  SiteSelectState,
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

const productSorter = (a: DataProduct, b: DataProduct): number => (
  a.productName.localeCompare(b.productName)
);
const siteSorter = (a: Site, b: Site): number => (
  a.siteDescription.localeCompare(b.siteDescription)
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
      selectedSite: state.selectedSite,
      sitesFetchState: state.sitesFetchState.asyncState,
    }),
  ),
  dataProductSelect: createDeepEqualSelector(
    [appStateSelector],
    (state: BaseStoreAppState): DataProductSelectState => ({
      productsFetchState: state.productsFetchState.asyncState,
      products: !existsNonEmpty(state.products)
        ? new Array<DataProductSelectOption>()
        : state.products
          .sort(productSorter)
          .map((value: DataProduct): DataProductSelectOption => {
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
  siteSelect: createDeepEqualSelector(
    [appStateSelector],
    (state: BaseStoreAppState): SiteSelectState => ({
      sitesFetchState: state.sitesFetchState.asyncState,
      sites: !existsNonEmpty(state.sites)
        ? new Array<SiteSelectOption>()
        : state.sites
          .sort(siteSorter)
          .map((value: Site): SiteSelectOption => {
            if (!exists(state.selectedRelease)) {
              return {
                ...value,
                hasData: existsNonEmpty(value.dataProducts),
              };
            }
            return {
              ...value,
              hasData: true,
            };
          }),
      selectedSite: state.selectedSite,
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
  siteAvailability: createDeepEqualSelector(
    [appStateSelector],
    (state: BaseStoreAppState): SiteAvailabilitySectionState => ({
      focalSiteFetchState: state.focalSiteFetchState.asyncState,
      focalSite: state.focalSite,
    }),
  ),
};

export default AppStateSelector;
