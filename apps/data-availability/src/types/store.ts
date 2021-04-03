import { AsyncState } from 'portal-core-components/lib/types/asyncFlow';
import { Nullable } from 'portal-core-components/lib/types/core';

export interface StoreRootState {
  app: BaseStoreAppState;
}

export interface BaseStoreAppState {
  productsFetchState: AsyncState<DataProduct[]>;
  products: DataProduct[];
  sitesFetchState: AsyncState<Site[]>;
  sites: Site[];
  releasesFetchState: AsyncState<Release[]>;
  releases: Release[];

  focalProductFetchState: AsyncState<Nullable<DataProduct>>;
  focalProduct: Nullable<DataProduct>;

  selectedRelease: Nullable<Release>;
  selectedProduct: Nullable<DataProduct>;
}

export interface DataProduct {
  productCode: string;
  productName: string;
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
}
