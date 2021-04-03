import AsyncFlow from 'portal-core-components/lib/flow/AsyncFlow';
import {
  AsyncState,
  AsyncFlowHandler,
  AsyncActionType,
  FlowActionTypes,
} from 'portal-core-components/lib/types/asyncFlow';

import AppActions from '../app';
import ProductParser from '../../parsers/ProductParser';
import { DataProduct } from '../../types/store';

interface AppAsyncFlowTypes {
  fetchProducts: AsyncFlowHandler<AsyncState<DataProduct[]>, AsyncActionType, DataProduct[]>;
}

const AppFlowActionTypes: FlowActionTypes = {
  fetchProducts: {
    fetch: AppActions.FETCH_PRODUCTS,
    working: AppActions.FETCH_PRODUCTS_WORKING,
    completed: AppActions.FETCH_PRODUCTS_COMPLETED,
    error: AppActions.FETCH_PRODUCTS_ERROR,
    reset: AppActions.RESET_FETCH_PRODUCTS,
  },
};

const AppFlow: AppAsyncFlowTypes = {
  fetchProducts: AsyncFlow.create<AsyncState<DataProduct[]>, AsyncActionType, DataProduct[]>(
    AppFlowActionTypes.fetchProducts,
    ProductParser.parseProducts,
  ),
};

export default AppFlow;
