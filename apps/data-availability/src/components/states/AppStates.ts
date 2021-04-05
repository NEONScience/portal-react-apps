import { AsyncStateType } from 'portal-core-components/lib/types/asyncFlow';
import { Nullable } from 'portal-core-components/lib/types/core';

import {
  DataProduct,
  Release,
  Site,
} from '../../types/store';

export interface AppComponentState {
  productsFetchState: AsyncStateType;
  products: DataProduct[];
  releaseFetchState: AsyncStateType;
  releases: Release[];
  sitesFetchState: AsyncStateType;
  focalProductFetchState: AsyncStateType;
  selectedRelease: Nullable<Release>;
  selectedProduct: Nullable<DataProduct>;
  selectedSite: Nullable<Site>;
}

export interface DataProductSelectOption extends DataProduct {
  hasData: boolean;
}
export interface SiteSelectOption extends Site {
  hasData: boolean;
}

export interface DataProductSelectState {
  productsFetchState: AsyncStateType;
  products: DataProductSelectOption[];
  selectedRelease: Nullable<Release>;
  selectedProduct: Nullable<DataProduct>;
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
}

export interface LocationsSectionState {
  focalProductFetchState: AsyncStateType;
  focalProduct: Nullable<DataProduct>;
  sitesFetchState: AsyncStateType;
  sites: Site[];
}

export interface SiteAvailabilitySectionState {
  focalSiteFetchState: AsyncStateType;
  focalSite: Nullable<Site>;
}
