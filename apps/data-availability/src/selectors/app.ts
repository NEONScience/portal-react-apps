import {
  createSelector,
  createSelectorCreator,
  defaultMemoize,
} from 'reselect';
import isEqual from 'lodash/isEqual';

import ReleaseService from 'portal-core-components/lib/service/ReleaseService';
import { AsyncStateType } from 'portal-core-components/lib/types/asyncFlow';
import { exists, existsNonEmpty, isStringNonEmpty } from 'portal-core-components/lib/util/typeUtil';
import { Nullable } from 'portal-core-components/lib/types/core';
import { DoiStatusType } from 'portal-core-components/lib/types/neonApi';

import {
  BaseStoreAppState,
  DataProduct,
  Release,
  StoreRootState,
  Site,
  DataProductParent,
  DataProductBundle,
  DataProductReleaseTombAva,
  DataProductReleaseDoi,
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
  TombstoneNoticeState,
} from '../components/states/AppStates';
import { determineBundle, findForwardChildren } from '../util/bundleUtil';

const ALLOW_ALL_PRODUCT_SELECT = true;

interface FocalProductInfo {
  appliedProduct: Nullable<DataProduct>;
  appliedBundleAvaProduct: Nullable<DataProduct>;
}

const appState = (state: StoreRootState): BaseStoreAppState => (
  state.app
);

const appStateSelector = createSelector(
  [appState],
  (state: BaseStoreAppState): BaseStoreAppState => state,
);

const determineBundleHelper = (state: BaseStoreAppState): DataProductBundle[] => (
  determineBundle(state.bundles, state.selectedRelease?.release)
);

const findFocalProductWithAva = (state: BaseStoreAppState): FocalProductInfo => {
  const { selectedProduct }: BaseStoreAppState = state;
  let appliedProduct: Nullable<DataProduct> = null;
  let appliedBundleAvaProduct: Nullable<DataProduct> = null;
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
    let parentCodeForwardAvail: string|undefined;
    const appliedBundles: DataProductBundle[] = determineBundleHelper(state);
    appliedBundles.some((checkBundle: DataProductBundle): boolean => {
      if (checkBundle.productCode.localeCompare(appliedProduct?.productCode || '') !== 0) {
        return false;
      }
      const parent = checkBundle.parentProducts
        .find((checkParent: DataProductParent): boolean => (
          checkParent.forwardAvailability
        ));
      if (parent && parent.forwardAvailability) {
        parentCodeForwardAvail = parent.parentProductCode;
      }
      return (parent && parent.forwardAvailability) || false;
    });
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
        appliedBundleAvaProduct = appliedAvail;
      }
    }
  }
  return { appliedProduct, appliedBundleAvaProduct };
};

const findFocalProduct = (state: BaseStoreAppState): Nullable<DataProduct> => {
  const focalProductInfo: FocalProductInfo = findFocalProductWithAva(state);
  return focalProductInfo.appliedProduct;
};
const findFocalProductBundle = (state: BaseStoreAppState): Nullable<DataProduct> => {
  const focalProductInfo: FocalProductInfo = findFocalProductWithAva(state);
  return focalProductInfo.appliedBundleAvaProduct;
};
const bundleProductSelector = createSelector(
  [appState],
  (state: BaseStoreAppState): Nullable<DataProduct> => findFocalProduct(state),
);
const bundleProductFullSelector = createSelector(
  [appState],
  (state: BaseStoreAppState): Nullable<DataProduct> => findFocalProductBundle(state),
);

const findAppliedRelease = (state: BaseStoreAppState): Nullable<Release> => {
  const { releases, selectedRelease }: BaseStoreAppState = state;
  let appliedRelease: Nullable<Release> = null;
  if (exists(selectedRelease)) {
    appliedRelease = selectedRelease;
    return appliedRelease;
  }
  if (existsNonEmpty(releases)) {
    const sortedReleases: Release[] = ReleaseService.sortReleases(releases);
    appliedRelease = sortedReleases[0];
  }
  return appliedRelease;
};
const appliedReleaseSelector = createSelector(
  [appState],
  (state: BaseStoreAppState): Nullable<Release> => findAppliedRelease(state),
);

const determineTombstoned = (state: BaseStoreAppState): boolean => {
  if (!exists(state.focalProductReleaseDoi)) {
    return false;
  }
  if (!Array.isArray(state.focalProductReleaseDoi)) {
    return state.focalProductReleaseDoi?.status === DoiStatusType.TOMBSTONED;
  }
  return state.focalProductReleaseDoi.every((d: DataProductReleaseDoi): boolean => (
    d.status === DoiStatusType.TOMBSTONED
  ));
};

const shouldFetchDoi = (state: BaseStoreAppState): boolean => {
  const {
    focalProductFetchState,
    focalProductReleaseDoiFetchState,
  }: BaseStoreAppState = state;
  if (focalProductFetchState.asyncState !== AsyncStateType.FULLFILLED) {
    return false;
  }
  if (focalProductReleaseDoiFetchState.asyncState !== AsyncStateType.IDLE) {
    return false;
  }
  const focalProduct: Nullable<DataProduct> = findFocalProduct(state);
  const appliedRelease = findAppliedRelease(state);
  if (!exists(focalProduct) || !exists(appliedRelease)) {
    return false;
  }
  const checkSiteCodes: Record<string, unknown>[] = !exists(focalProduct)
    ? new Array<Record<string, unknown>>()
    : (focalProduct as DataProduct).siteCodes;
  return !existsNonEmpty(checkSiteCodes);
};
const shouldFetchTombAva = (state: BaseStoreAppState): boolean => {
  const {
    focalProductFetchState,
    focalProductReleaseDoiFetchState,
    focalProductReleaseTombAvaFetchState,
  }: BaseStoreAppState = state;
  if (focalProductFetchState.asyncState !== AsyncStateType.FULLFILLED) {
    return false;
  }
  if (focalProductReleaseDoiFetchState.asyncState !== AsyncStateType.FULLFILLED) {
    return false;
  }
  if (!determineTombstoned(state)) {
    return false;
  }
  if (focalProductReleaseTombAvaFetchState.asyncState !== AsyncStateType.IDLE) {
    return false;
  }
  return true;
};

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
      bundles: state.bundles,
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
    [appStateSelector, bundleProductFullSelector],
    (
      state: BaseStoreAppState,
      bundledProduct: Nullable<DataProduct>,
    ): DataProductSelectState => ({
      bundlesFetchState: state.bundlesFetchState.asyncState,
      bundles: state.bundles,
      productsFetchState: state.productsFetchState.asyncState,
      products: !existsNonEmpty(state.products)
        ? new Array<DataProductSelectOption>()
        : state.products
          .map((value: DataProduct): DataProductSelectOption => {
            if (!exists(state.selectedRelease)) {
              return {
                ...value,
                hasData: ALLOW_ALL_PRODUCT_SELECT ? true : existsNonEmpty(value.siteCodes),
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
              hasData: ALLOW_ALL_PRODUCT_SELECT ? true : hasData,
            };
          })
          .sort(productSorter),
      selectedProduct: state.selectedProduct,
      selectedRelease: state.selectedRelease,
      focalBundleProduct: bundledProduct,
    }),
  ),
  siteSelect: createDeepEqualSelector(
    [appStateSelector],
    (state: BaseStoreAppState): SiteSelectState => ({
      sitesFetchState: state.sitesFetchState.asyncState,
      sites: !existsNonEmpty(state.sites)
        ? new Array<SiteSelectOption>()
        : state.sites
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
          })
          .sort(siteSorter),
      selectedSite: state.selectedSite,
      selectedRelease: state.selectedRelease,
    }),
  ),
  availability: createDeepEqualSelector(
    [appStateSelector, bundleProductSelector, appliedReleaseSelector],
    (
      state: BaseStoreAppState,
      bundledProduct: Nullable<DataProduct>,
      appliedRelease: Nullable<Release>,
    ): AvailabilitySectionState => ({
      focalProductFetchState: state.focalProductFetchState.asyncState,
      focalProduct: bundledProduct,
      appliedRelease: appliedRelease,
      fetchProductReleaseDoi: shouldFetchDoi(state),
      focalProductReleaseDoiFetchState: state.focalProductReleaseDoiFetchState.asyncState,
      isTombstoned: determineTombstoned(state),
      fetchProductReleaseTombAva: shouldFetchTombAva(state),
      focalProductReleaseTombAvaFetchState: state.focalProductReleaseTombAvaFetchState.asyncState,
      focalProductReleaseTombAva: state.focalProductReleaseTombAva,
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
          if (!existsNonEmpty(siteCodes)) {
            const isTombstoned: boolean = determineTombstoned(state);
            if (isTombstoned && exists(state.focalProductReleaseTombAva)) {
              const tombAva = state.focalProductReleaseTombAva as DataProductReleaseTombAva;
              if (existsNonEmpty(tombAva.siteCodes)) {
                siteCodes = tombAva.siteCodes
                  .map((value: Record<string, unknown>): string => (
                    value.siteCode as string
                  ));
              }
            }
          }
          break;
      }
      const isFocalProductReleaseWorking = (
        ((state.focalProductReleaseDoiFetchState.asyncState === AsyncStateType.WORKING)
          || shouldFetchDoi(state))
        || ((state.focalProductReleaseTombAvaFetchState.asyncState === AsyncStateType.WORKING)
          || shouldFetchTombAva(state))
      );
      return {
        sitesFetchState: state.sitesFetchState.asyncState,
        sites: state.sites,
        viewModeSwitching: state.viewModeSwitching,
        selectedViewMode: state.selectedViewMode,
        isTombstoned: determineTombstoned(state),
        isFocalProductReleaseWorking,
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
        determineBundleHelper(state),
      ),
    }),
  ),
  tombstoneNotice: createSelector(
    [appStateSelector],
    (state: BaseStoreAppState): TombstoneNoticeState => ({
      isTombstoned: determineTombstoned(state),
      focalProductReleaseDoi: state.focalProductReleaseDoi,
    }),
  ),
};

export default AppStateSelector;
