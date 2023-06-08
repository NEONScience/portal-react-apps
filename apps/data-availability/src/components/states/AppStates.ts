import { AsyncStateType } from 'portal-core-components/lib/types/asyncFlow';
import { Nullable } from 'portal-core-components/lib/types/core';

import {
  DataProduct,
  Release,
  Site,
  SelectOption,
  DataProductBundle,
  DataProductReleaseTombAva,
  DataProductReleaseDoi,
} from '../../types/store';

export interface AppComponentState {
  productsFetchState: AsyncStateType;
  products: DataProduct[];
  releaseFetchState: AsyncStateType;
  releases: Release[];
  sitesFetchState: AsyncStateType;
  bundlesFetchState: AsyncStateType;
  bundles: Record<string, DataProductBundle[]>;
  focalProductFetchState: AsyncStateType;
  selectedRelease: Nullable<Release>;
  selectedProduct: Nullable<DataProduct>;
  selectedSite: Nullable<Site>;
  selectedViewMode: SelectOption;
  viewModes: SelectOption[];
}

export interface DataProductSelectOption extends DataProduct {
  hasData: boolean;
}
export interface SiteSelectOption extends Site {
  hasData: boolean;
}

export interface DataProductSelectState {
  bundlesFetchState: AsyncStateType;
  bundles: Record<string, DataProductBundle[]>;
  productsFetchState: AsyncStateType;
  products: DataProductSelectOption[];
  selectedRelease: Nullable<Release>;
  selectedProduct: Nullable<DataProduct>;
  focalBundleProduct: Nullable<DataProduct>;
}
export interface SiteSelectState {
  sitesFetchState: AsyncStateType;
  sites: SiteSelectOption[];
  selectedRelease: Nullable<Release>;
  selectedSite: Nullable<Site>;
}

export interface AvailabilitySectionState {
  focalProductFetchState: AsyncStateType;
  focalProduct: Nullable<DataProduct>;
  appliedRelease: Nullable<Release>;
  delineateAvaRelease: boolean;
  fetchProductReleaseDoi: boolean;
  focalProductReleaseDoiFetchState: AsyncStateType;
  isTombstoned: Nullable<boolean>;
  fetchProductReleaseTombAva: boolean;
  focalProductReleaseTombAvaFetchState: AsyncStateType;
  focalProductReleaseTombAva: Nullable<DataProductReleaseTombAva>;
}

export interface LocationsSectionState {
  fetchState: AsyncStateType;
  siteCodes: string[];
  sitesFetchState: AsyncStateType;
  sites: Site[];
  viewModeSwitching: boolean;
  selectedViewMode: SelectOption;
  isTombstoned: Nullable<boolean>;
  isFocalProductReleaseWorking: Nullable<boolean>;
}

export interface SiteAvailabilitySectionState {
  focalSiteFetchState: AsyncStateType;
  focalSite: Nullable<Site>;
}

export interface TombstoneNoticeState {
  isTombstoned: Nullable<boolean>;
  focalProductReleaseDoi: Nullable<DataProductReleaseDoi|DataProductReleaseDoi[]>;
}
