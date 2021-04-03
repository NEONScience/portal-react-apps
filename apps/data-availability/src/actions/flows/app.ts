/* eslint-disable max-len */

import AsyncFlow from 'portal-core-components/lib/flow/AsyncFlow';
import {
  AsyncState,
  AsyncFlowHandler,
  AsyncActionType,
  FlowActionTypes,
} from 'portal-core-components/lib/types/asyncFlow';
import { Nullable } from 'portal-core-components/lib/types/core';

import AppActions from '../app';
import ProductParser from '../../parsers/ProductParser';
import ReleaseParser from '../../parsers/ReleaseParser';
import SiteParser from '../../parsers/SiteParser';
import { DataProduct, Release, Site } from '../../types/store';

interface AppAsyncFlowTypes {
  fetchProducts: AsyncFlowHandler<AsyncState<DataProduct[]>, AsyncActionType, DataProduct[]>;
  fetchSites: AsyncFlowHandler<AsyncState<Site[]>, AsyncActionType, Site[]>;
  fetchReleases: AsyncFlowHandler<AsyncState<Release[]>, AsyncActionType, Release[]>;
  fetchFocalProduct: AsyncFlowHandler<AsyncState<Nullable<DataProduct>>, AsyncActionType, Nullable<DataProduct>>;
}

const AppFlowActionTypes: FlowActionTypes = {
  fetchProducts: {
    fetch: AppActions.FETCH_PRODUCTS,
    working: AppActions.FETCH_PRODUCTS_WORKING,
    completed: AppActions.FETCH_PRODUCTS_COMPLETED,
    error: AppActions.FETCH_PRODUCTS_ERROR,
    reset: AppActions.RESET_FETCH_PRODUCTS,
  },
  fetchSites: {
    fetch: AppActions.FETCH_SITES,
    working: AppActions.FETCH_SITES_WORKING,
    completed: AppActions.FETCH_SITES_COMPLETED,
    error: AppActions.FETCH_SITES_ERROR,
    reset: AppActions.RESET_FETCH_SITES,
  },
  fetchReleases: {
    fetch: AppActions.FETCH_RELEASES,
    working: AppActions.FETCH_RELEASES_WORKING,
    completed: AppActions.FETCH_RELEASES_COMPLETED,
    error: AppActions.FETCH_RELEASES_ERROR,
    reset: AppActions.RESET_FETCH_RELEASES,
  },
  fetchFocalProduct: {
    fetch: AppActions.FETCH_FOCAL_PRODUCT,
    working: AppActions.FETCH_FOCAL_PRODUCT_WORKING,
    completed: AppActions.FETCH_FOCAL_PRODUCT_COMPLETED,
    error: AppActions.FETCH_FOCAL_PRODUCT_ERROR,
    reset: AppActions.RESET_FETCH_FOCAL_PRODUCT,
  },
};

const AppFlow: AppAsyncFlowTypes = {
  fetchProducts: AsyncFlow.create<AsyncState<DataProduct[]>, AsyncActionType, DataProduct[]>(
    AppFlowActionTypes.fetchProducts,
    ProductParser.parseProducts,
  ),
  fetchSites: AsyncFlow.create<AsyncState<Site[]>, AsyncActionType, Site[]>(
    AppFlowActionTypes.fetchSites,
    SiteParser.parseSites,
  ),
  fetchReleases: AsyncFlow.create<AsyncState<Release[]>, AsyncActionType, Release[]>(
    AppFlowActionTypes.fetchReleases,
    ReleaseParser.parseReleases,
  ),
  fetchFocalProduct: AsyncFlow.create<AsyncState<Nullable<DataProduct>>, AsyncActionType, Nullable<DataProduct>>(
    AppFlowActionTypes.fetchFocalProduct,
    ProductParser.parseProductResponse,
  ),
};

export default AppFlow;
