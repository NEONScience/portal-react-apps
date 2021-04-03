import { AsyncState } from 'portal-core-components/lib/types/asyncFlow';

export interface StoreRootState {
  app: BaseStoreAppState;
}

export interface BaseStoreAppState {
  productsFetchState: AsyncState<DataProduct[]>;
  products: DataProduct[];
}

export interface DataProduct {
  productCode: string;
  productName: string;
  productDescription: string;
}
