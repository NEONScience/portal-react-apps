import {
  createSelector,
  createSelectorCreator,
  defaultMemoize,
} from 'reselect';
import isEqual from 'lodash/isEqual';

import { AsyncStateType } from 'portal-core-components/lib/types/asyncFlow';
import { exists, existsNonEmpty, isStringNonEmpty } from 'portal-core-components/lib/util/typeUtil';
import { Nullable } from 'portal-core-components/lib/types/core';

import {
  BaseStoreAppState,
  DataProduct,
  Release,
  StoreRootState,
  Site,
  DataProductParent,
  DataProductBundle,
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
import { findForwardChildren } from '../util/bundleUtil';

const appState = (state: StoreRootState): BaseStoreAppState => (
  state.app
);

const appStateSelector = createSelector(
  [appState],
  (state: BaseStoreAppState): BaseStoreAppState => state,
);

const getProvReleaseRegex = (): RegExp => new RegExp(/^[A-Z]+$/);

const determineBundle = (state: BaseStoreAppState): DataProductBundle[] => {
  const defaultBundle = (state.bundles.PROVISIONAL ? state.bundles.PROVISIONAL : []);
  const regex = getProvReleaseRegex();
  let isLatestProv = false;
  if (state.selectedRelease && regex) {
    const matches = regex.exec(state.selectedRelease.release);
    isLatestProv = exists(matches) && ((matches as RegExpExecArray).length > 0);
  }
  let appliedRelease = state.selectedRelease?.release;
  if (isLatestProv) {
    appliedRelease = 'PROVISIONAL';
  }
  return state.selectedRelease
    ? state.bundles[appliedRelease as string]
    : defaultBundle;
};

const findFocalProduct = (state: BaseStoreAppState): Nullable<DataProduct> => {
  let parentCodeForwardAvail: string|undefined;
  const appliedBundles: DataProductBundle[] = determineBundle(state);
  appliedBundles.some((checkBundle: DataProductBundle): boolean => {
    const parent = checkBundle.parentProducts
      .find((checkParent: DataProductParent): boolean => (
        checkParent.forwardAvailability
      ));
    if (parent && parent.forwardAvailability) {
      parentCodeForwardAvail = parent.parentProductCode;
    }
    return (parent && parent.forwardAvailability) || false;
  });
  const { selectedProduct }: BaseStoreAppState = state;
  let appliedProduct: Nullable<DataProduct> = null;
  const appliedProducts: Nullable<DataProduct[]> = state.focalProduct;
  if (existsNonEmpty(appliedProducts)) {
    if (!selectedProduct) {
      [appliedProduct] = (appliedProducts as DataProduct[]);
    } else {
      appliedProduct = (appliedProducts as DataProduct[])
        .find((value: DataProduct): boolean => (
          selectedProduct.productCode.localeCompare(value.productCode) === 0
        ));
      if (!appliedProduct) {
        [appliedProduct] = (appliedProducts as DataProduct[]);
      }
    }
    if (isStringNonEmpty(parentCodeForwardAvail)) {
      const appliedAvail: DataProduct|undefined = (appliedProducts as DataProduct[])
        .find((product: DataProduct): boolean => (
          product.productCode.localeCompare(parentCodeForwardAvail as string) === 0
        ));
      if (appliedAvail) {
        appliedProduct = {
          ...appliedProduct,
          siteCodes: appliedAvail.siteCodes,
        };
      }
    }
  }
  return appliedProduct;
};
const bundleProductSelector = createSelector(
  [appState],
  (state: BaseStoreAppState): Nullable<DataProduct> => findFocalProduct(state),
);

const transformSiteForBundles = (
  focalSite: Nullable<Site>,
  products: DataProduct[],
  bundles: DataProductBundle[],
): Nullable<Site> => {
  if (!exists(focalSite)) {
    return focalSite;
  }
  const appliedProducts: Record<string, unknown>[] = (focalSite as Site).dataProducts;
  const forwardCodeMap: { [key: string]: string } = findForwardChildren(bundles);
  const bundledProducts: Record<string, unknown>[] = [];
  Object.keys(forwardCodeMap).forEach((childCode: string): void => {
    const parentAvail: Record<string, unknown>|undefined = appliedProducts
      .find((value: Record<string, unknown>): boolean => (
        (value.dataProductCode as string).localeCompare(forwardCodeMap[childCode]) === 0
      ));
    if (parentAvail) {
      const childProduct: DataProduct|undefined = products
        .find((product: DataProduct): boolean => (
          product.productCode.localeCompare(childCode) === 0
        ));
      if (childProduct) {
        const appliedTitle = `${childProduct.productName}. `
          + `Showing availability for parent bundle product: ${parentAvail.dataProductCode as string}`;
        bundledProducts.push({
          ...parentAvail,
          dataProductCode: childCode,
          dataProductTitle: appliedTitle,
        });
      }
    }
  });
  bundledProducts.forEach((bundleAvail: Record<string, unknown>): void => {
    appliedProducts.push(bundleAvail);
  });
  bundledProducts.sort((a, b): number => (
    (a.dataProductCode as string).localeCompare(b.dataProductCode as string)
  ));
  return {
    ...focalSite as Site,
    dataProducts: appliedProducts,
  };
};

const createDeepEqualSelector = createSelectorCreator(
  defaultMemoize,
  isEqual,
);

const productSorter = (a: DataProduct, b: DataProduct): number => {
  const scienceTeamSort: number = a.productScienceTeam.localeCompare(b.productScienceTeam);
  return (scienceTeamSort === 0)
    ? a.productName.localeCompare(b.productName)
    : scienceTeamSort;
};
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
      bundlesFetchState: state.bundlesFetchState.asyncState,
      bundles: determineBundle(state),
      focalProductFetchState: state.focalProductFetchState.asyncState,
      selectedProduct: state.selectedProduct,
      selectedRelease: state.selectedRelease,
      selectedSite: state.selectedSite,
      sitesFetchState: state.sitesFetchState.asyncState,
      selectedViewMode: state.selectedViewMode,
      viewModes: state.viewModes,
    }),
  ),
  dataProductSelect: createDeepEqualSelector(
    [appStateSelector],
    (state: BaseStoreAppState): DataProductSelectState => ({
      bundlesFetchState: state.bundlesFetchState.asyncState,
      bundles: determineBundle(state),
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
            let hasData: boolean|undefined = false;
            if (!existsNonEmpty(release.dataProducts)) {
              hasData = Array.isArray(value.siteCodes)
                && (value.siteCodes.length > 0);
            } else {
              hasData = release.dataProducts.some((product: DataProduct): boolean => (
                product.productCode === value.productCode
              ));
            }
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
    [appStateSelector, bundleProductSelector],
    (
      state: BaseStoreAppState,
      bundledProduct: Nullable<DataProduct>,
    ): AvailabilitySectionState => ({
      focalProductFetchState: state.focalProductFetchState.asyncState,
      focalProduct: bundledProduct,
    }),
  ),
  locations: createDeepEqualSelector(
    [appStateSelector],
    (state: BaseStoreAppState): LocationsSectionState => {
      let fetchState: AsyncStateType;
      let siteCodes: string[];
      let focalProduct: Nullable<DataProduct> = null;
      switch (state.selectedViewMode.value) {
        case 'Site':
          fetchState = state.focalSiteFetchState.asyncState;
          siteCodes = !exists(state.focalSite)
            ? []
            : [(state.focalSite as Site).siteCode];
          break;
        case 'DataProduct':
        default:
          fetchState = state.focalProductFetchState.asyncState;
          focalProduct = findFocalProduct(state);
          // eslint-disable-next-line no-case-declarations
          const productSiteCodes: Record<string, unknown>[] = !exists(focalProduct)
            ? new Array<Record<string, unknown>>()
            : (focalProduct as DataProduct).siteCodes;
          siteCodes = productSiteCodes
            .map((value: Record<string, unknown>): string => (
              value.siteCode as string
            ));
          break;
      }
      return {
        sitesFetchState: state.sitesFetchState.asyncState,
        sites: state.sites,
        viewModeSwitching: state.viewModeSwitching,
        selectedViewMode: state.selectedViewMode,
        fetchState,
        siteCodes,
      };
    },
  ),
  siteAvailability: createDeepEqualSelector(
    [appStateSelector],
    (state: BaseStoreAppState): SiteAvailabilitySectionState => ({
      focalSiteFetchState: state.focalSiteFetchState.asyncState,
      focalSite: transformSiteForBundles(
        state.focalSite,
        state.products,
        determineBundle(state),
      ),
    }),
  ),
};

export default AppStateSelector;
