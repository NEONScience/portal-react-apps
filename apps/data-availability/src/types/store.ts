import { AsyncState } from 'portal-core-components/lib/types/asyncFlow';
import { Nullable } from 'portal-core-components/lib/types/core';

export interface StoreRootState {
  app: BaseStoreAppState;
}

export interface SelectOption {
  value: string;
  title: string;
}

export interface BaseStoreAppState {
  productsFetchState: AsyncState<DataProduct[]>;
  products: DataProduct[];
  sitesFetchState: AsyncState<Site[]>;
  sites: Site[];
  releasesFetchState: AsyncState<Release[]>;
  releases: Release[];
  bundlesFetchState: AsyncState<DataProductBundle[]>;
  bundles: Record<string, DataProductBundle[]>;

  focalProductFetchState: AsyncState<Nullable<DataProduct[]>>;
  focalProduct: Nullable<DataProduct[]>;
  focalSiteFetchState: AsyncState<Nullable<Site>>;
  focalSite: Nullable<Site>;

  focalProductReleaseDoiFetchState: AsyncState<Nullable<DataProductReleaseDoi>>;
  focalProductReleaseDoi: Nullable<DataProductReleaseDoi>;
  focalProductReleaseTombAvaFetchState: AsyncState<Nullable<DataProductReleaseTombAva>>;
  focalProductReleaseTombAva: Nullable<DataProductReleaseTombAva>;

  selectedRelease: Nullable<Release>;
  selectedProduct: Nullable<DataProduct>;
  selectedSite: Nullable<Site>;

  selectedViewMode: SelectOption;
  viewModes: SelectOption[];
  viewModeSwitching: boolean;
}

export interface DataProductParent {
  parentProductCode: string;
  forwardAvailability: boolean;
}

export interface DataProductBundle {
  productCode: string;
  parentProducts: DataProductParent[];
}

export interface DataProduct {
  productCode: string;
  productName: string;
  productDescription: string;
  productScienceTeam: string;
  siteCodes: Record<string, unknown>[];
}

export interface Release {
  release: string;
  generationDate: string;
  dataProducts: DataProduct[];
}

export interface Site {
  siteCode: string;
  siteDescription: string;
  siteLatitude: number;
  siteLongitude: number;
  domainCode: string;
  stateCode: string;
  dataProducts: Record<string, unknown>[];
}

export interface DataProductReleaseDoi {
  productCode: string;
  release: string;
  releaseGenerationDate: string;
  generationDate: string;
  url: string;
  status: string;
}

export interface DataProductReleaseTombAva {
  productCode: string;
  productName: string;
  release: string;
  siteCodes: Record<string, unknown>[];
}
