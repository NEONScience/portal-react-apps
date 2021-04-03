import { AsyncStateType } from 'portal-core-components/lib/types/asyncFlow';

import { DataProduct } from '../../types/store';

export interface AppComponentState {
  productFetchState: AsyncStateType;
  products: DataProduct[];
}
