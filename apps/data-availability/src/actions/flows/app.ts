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
import {
  DataProduct,
  DataProductBundle,
  Release,
  Site,
  DataProductReleaseDoi,
  DataProductReleaseTombAva,
} from '../../types/store';

interface AppAsyncFlowTypes {
  fetchProducts: AsyncFlowHandler<AsyncState<DataProduct[]>, AsyncActionType, DataProduct[]>;
  fetchSites: AsyncFlowHandler<AsyncState<Site[]>, AsyncActionType, Site[]>;
  fetchReleases: AsyncFlowHandler<AsyncState<Release[]>, AsyncActionType, Release[]>;
  fetchProductBundles: AsyncFlowHandler<AsyncState<Record<string, DataProductBundle[]>>, AsyncActionType, Record<string, DataProductBundle[]>>;
  fetchFocalProduct: AsyncFlowHandler<AsyncState<Nullable<DataProduct[]>>, AsyncActionType, Nullable<DataProduct[]>>;
  fetchFocalSite: AsyncFlowHandler<AsyncState<Nullable<Site>>, AsyncActionType, Nullable<Site>>;
  fetchFocalProductReleaseDoi: AsyncFlowHandler<AsyncState<Nullable<DataProductReleaseDoi|DataProductReleaseDoi[]>>, AsyncActionType, Nullable<DataProductReleaseDoi|DataProductReleaseDoi[]>>;
  fetchFocalProductReleaseTombAva: AsyncFlowHandler<AsyncState<Nullable<DataProductReleaseTombAva>>, AsyncActionType, Nullable<DataProductReleaseTombAva>>;
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
  fetchProductBundles: {
    fetch: AppActions.FETCH_PRODUCT_BUNDLES,
    working: AppActions.FETCH_PRODUCT_BUNDLES_WORKING,
    completed: AppActions.FETCH_PRODUCT_BUNDLES_COMPLETED,
    error: AppActions.FETCH_PRODUCT_BUNDLES_ERROR,
    reset: AppActions.RESET_FETCH_PRODUCT_BUNDLES,
  },
  fetchFocalProduct: {
    fetch: AppActions.FETCH_FOCAL_PRODUCT,
    working: AppActions.FETCH_FOCAL_PRODUCT_WORKING,
    completed: AppActions.FETCH_FOCAL_PRODUCT_COMPLETED,
    error: AppActions.FETCH_FOCAL_PRODUCT_ERROR,
    reset: AppActions.RESET_FETCH_FOCAL_PRODUCT,
  },
  fetchFocalSite: {
    fetch: AppActions.FETCH_FOCAL_SITE,
    working: AppActions.FETCH_FOCAL_SITE_WORKING,
    completed: AppActions.FETCH_FOCAL_SITE_COMPLETED,
    error: AppActions.FETCH_FOCAL_SITE_ERROR,
    reset: AppActions.RESET_FETCH_FOCAL_SITE,
  },
  fetchFocalProductReleaseDoi: {
    fetch: AppActions.FETCH_FOCAL_PRODUCT_RELEASE_DOI,
    working: AppActions.FETCH_FOCAL_PRODUCT_RELEASE_DOI_WORKING,
    completed: AppActions.FETCH_FOCAL_PRODUCT_RELEASE_DOI_COMPLETED,
    error: AppActions.FETCH_FOCAL_PRODUCT_RELEASE_DOI_ERROR,
    reset: AppActions.RESET_FETCH_FOCAL_PRODUCT_RELEASE_DOI,
  },
  fetchFocalProductReleaseTombAva: {
    fetch: AppActions.FETCH_FOCAL_PRODUCT_RELEASE_TOMB_AVA,
    working: AppActions.FETCH_FOCAL_PRODUCT_RELEASE_TOMB_AVA_WORKING,
    completed: AppActions.FETCH_FOCAL_PRODUCT_RELEASE_TOMB_AVA_COMPLETED,
    error: AppActions.FETCH_FOCAL_PRODUCT_RELEASE_TOMB_AVA_ERROR,
    reset: AppActions.RESET_FETCH_FOCAL_PRODUCT_RELEASE_TOMB_AVA,
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
  fetchProductBundles: AsyncFlow.create<AsyncState<Record<string, DataProductBundle[]>>, AsyncActionType, Record<string, DataProductBundle[]>>(
    AppFlowActionTypes.fetchProductBundles,
    ProductParser.parseBundles,
  ),
  fetchFocalProduct: AsyncFlow.create<AsyncState<Nullable<DataProduct[]>>, AsyncActionType, Nullable<DataProduct[]>>(
    AppFlowActionTypes.fetchFocalProduct,
    ProductParser.parseProductResponse,
  ),
  fetchFocalSite: AsyncFlow.create<AsyncState<Nullable<Site>>, AsyncActionType, Nullable<Site>>(
    AppFlowActionTypes.fetchFocalSite,
    SiteParser.parseSiteResponse,
  ),
  fetchFocalProductReleaseDoi: AsyncFlow.create<AsyncState<Nullable<DataProductReleaseDoi|DataProductReleaseDoi[]>>, AsyncActionType, Nullable<DataProductReleaseDoi|DataProductReleaseDoi[]>>(
    AppFlowActionTypes.fetchFocalProductReleaseDoi,
    ProductParser.parseProductReleaseDoi,
  ),
  fetchFocalProductReleaseTombAva: AsyncFlow.create<AsyncState<Nullable<DataProductReleaseTombAva>>, AsyncActionType, Nullable<DataProductReleaseTombAva>>(
    AppFlowActionTypes.fetchFocalProductReleaseTombAva,
    ProductParser.parseProductReleaseTombAva,
  ),
};

export default AppFlow;
