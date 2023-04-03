/* eslint-disable import/prefer-default-export */

import { Observable, of } from 'rxjs';
import { AjaxResponse } from 'rxjs/ajax';

import NeonEnvironment from 'portal-core-components/lib/components/NeonEnvironment/NeonEnvironment';
import NeonGraphQL from 'portal-core-components/lib/components/NeonGraphQL/NeonGraphQL';
import EpicService from 'portal-core-components/lib/flow/EpicService';
import { AnyObject, UnknownRecord } from 'portal-core-components/lib/types/core';
import { exists, isStringNonEmpty } from 'portal-core-components/lib/util/typeUtil';
import { AsyncParamAction } from 'portal-core-components/lib/types/asyncFlow';

import AppActions from '../actions/app';
import AppFlow from '../actions/flows/app';
import { AppActionType } from '../actions/actionTypes';
import { handleError } from './helpers';
import { BaseStoreAppState } from '../types/store';
import { resolveAny } from '../util/typeUtil';

const productsQuery = `query Products {
  products {
    productCode
    productName
    productDescription
    productScienceTeam
    siteCodes {
      siteCode
    }
  }
}`;
const sitesQuery = `query Sites {
  sites {
    siteCode
    siteDescription
    siteLatitude
    siteLongitude
    domainCode
    stateCode
    dataProducts {
      dataProductCode
    }
  }
}`;
const buildProductQuery = (productCodes: string[], release?: string): string => {
  const hasRelease = isStringNonEmpty(release);
  const releaseArgument = !hasRelease ? '' : `, release: "${release as string}"`;
  const availableReleases = hasRelease
    ? ''
    : `availableReleases {
      release
      availableMonths
    }`;
  return `query filterProducts {
    products: filterProducts(filter: {
      productCodes: ["${productCodes.join('", "')}"]${releaseArgument}
    }) {
      productCode
      productName
      productDescription
      productScienceTeam
      siteCodes {
        siteCode
        availableMonths
        ${availableReleases}
      }
    }
  }`;
};
const buildSiteQuery = (siteCode: string, release?: string): string => {
  const hasRelease = isStringNonEmpty(release);
  const releaseArgument = !hasRelease ? '' : `, release: "${release as string}"`;
  const availableReleases = hasRelease
    ? ''
    : `availableReleases {
      release
      availableMonths
    }`;
  return `query Site {
    site (siteCode: "${siteCode}"${releaseArgument}) {
      siteCode
      siteDescription
      siteLatitude
      siteLongitude
      domainCode
      stateCode
      dataProducts {
        dataProductCode
        dataProductTitle
        availableMonths
        ${availableReleases}
      }
    }
  }`;
};

const fetchProductsEpic = EpicService.createEpicFromProps<AppActionType, BaseStoreAppState>({
  ofTypeFilter: AppActions.FETCH_PRODUCTS,
  takeUntilTypeFilter: AppActions.RESET_FETCH_PRODUCTS,
  request: {
    method: 'POST',
    url: '',
    crossDomain: true,
    withCredentials: NeonEnvironment.requireCors(),
    headers: { 'Content-Type': 'application/json' },
    responseType: 'json',
  },
  workingAction: AppFlow.fetchProducts.asyncWorkingAction,
  successAction: (
    response: AjaxResponse<unknown> | AjaxResponse<unknown>[],
    action?: AppActionType,
  ): Observable<unknown> => {
    const resolved: UnknownRecord = resolveAny(response as never, 'response');
    if (exists(resolved) && exists(resolved.data)) {
      return of(AppFlow.fetchProducts.asyncCompletedAction(resolved));
    }
    return of(AppFlow.fetchProducts.asyncErrorAction(null, 'Fetching products error'));
  },
  errorAction: (error: AjaxResponse<unknown>): Observable<unknown> => (
    handleError(error, AppFlow.fetchProducts.asyncErrorAction)
  ),
  requestInjector: (request: AnyObject, action: AnyObject): AnyObject => ({
    ...request,
    ...NeonGraphQL.getGraphqlAjaxRequest(productsQuery),
  }),
});

const fetchSitesEpic = EpicService.createEpicFromProps<AppActionType, BaseStoreAppState>({
  ofTypeFilter: AppActions.FETCH_SITES,
  takeUntilTypeFilter: AppActions.RESET_FETCH_SITES,
  request: {
    method: 'POST',
    url: '',
    crossDomain: true,
    withCredentials: NeonEnvironment.requireCors(),
    headers: { 'Content-Type': 'application/json' },
    responseType: 'json',
  },
  workingAction: AppFlow.fetchSites.asyncWorkingAction,
  successAction: (
    response: AjaxResponse<unknown> | AjaxResponse<unknown>[],
    action?: AppActionType,
  ): Observable<unknown> => {
    const resolved: UnknownRecord = resolveAny(response as never, 'response');
    if (exists(resolved) && exists(resolved.data)) {
      return of(AppFlow.fetchSites.asyncCompletedAction(resolved));
    }
    return of(AppFlow.fetchSites.asyncErrorAction(null, 'Fetching sites error'));
  },
  errorAction: (error: AjaxResponse<unknown>): Observable<unknown> => (
    handleError(error, AppFlow.fetchSites.asyncErrorAction)
  ),
  requestInjector: (request: AnyObject, action: AnyObject): AnyObject => ({
    ...request,
    ...NeonGraphQL.getGraphqlAjaxRequest(sitesQuery),
  }),
});

const fetchReleasesEpic = EpicService.createEpicFromProps<AppActionType, BaseStoreAppState>({
  ofTypeFilter: AppActions.FETCH_RELEASES,
  takeUntilTypeFilter: AppActions.RESET_FETCH_RELEASES,
  request: {
    method: 'GET',
    crossDomain: true,
    withCredentials: NeonEnvironment.requireCors(),
    responseType: 'json',
    url: NeonEnvironment.getFullApiPath('releases'),
  },
  workingAction: AppFlow.fetchReleases.asyncWorkingAction,
  successAction: (
    response: AjaxResponse<unknown> | AjaxResponse<unknown>[],
    action?: AppActionType,
  ): Observable<unknown> => {
    const resolved: UnknownRecord = resolveAny(response as never, 'response');
    if (exists(resolved) && exists(resolved.data)) {
      return of(AppFlow.fetchReleases.asyncCompletedAction(resolved));
    }
    return of(AppFlow.fetchReleases.asyncErrorAction(null, 'Fetching releases error'));
  },
  errorAction: (error: AjaxResponse<unknown>): Observable<unknown> => (
    handleError(error, AppFlow.fetchReleases.asyncErrorAction)
  ),
});

const fetchBundlesEpic = EpicService.createEpicFromProps<AppActionType, BaseStoreAppState>({
  ofTypeFilter: AppActions.FETCH_PRODUCT_BUNDLES,
  takeUntilTypeFilter: AppActions.RESET_FETCH_PRODUCT_BUNDLES,
  request: {
    method: 'GET',
    crossDomain: true,
    withCredentials: NeonEnvironment.requireCors(),
    responseType: 'json',
    url: NeonEnvironment.getFullApiPath('productBundles'),
  },
  workingAction: AppFlow.fetchProductBundles.asyncWorkingAction,
  successAction: (
    response: AjaxResponse<unknown> | AjaxResponse<unknown>[],
    action?: AppActionType,
  ): Observable<unknown> => {
    const resolved: UnknownRecord = resolveAny(response as never, 'response');
    if (exists(resolved)) {
      return of(AppFlow.fetchProductBundles.asyncCompletedAction(resolved));
    }
    return of(AppFlow.fetchProductBundles.asyncErrorAction(null, 'Fetching bundles error'));
  },
  errorAction: (error: AjaxResponse<unknown>): Observable<unknown> => (
    handleError(error, AppFlow.fetchProductBundles.asyncErrorAction)
  ),
});

const fetchFocalProductEpic = EpicService.createEpicFromProps<AppActionType, BaseStoreAppState>({
  ofTypeFilter: AppActions.FETCH_FOCAL_PRODUCT,
  takeUntilTypeFilter: AppActions.RESET_FETCH_FOCAL_PRODUCT,
  request: {
    method: 'POST',
    url: '',
    crossDomain: true,
    withCredentials: NeonEnvironment.requireCors(),
    headers: { 'Content-Type': 'application/json' },
    responseType: 'json',
  },
  workingAction: AppFlow.fetchFocalProduct.asyncWorkingAction,
  successAction: (
    response: AjaxResponse<unknown> | AjaxResponse<unknown>[],
    action?: AppActionType,
  ): Observable<unknown> => {
    const resolved: UnknownRecord = resolveAny(response as never, 'response');
    if (exists(resolved) && exists(resolved.data)) {
      return of(AppFlow.fetchFocalProduct.asyncCompletedAction(resolved));
    }
    return of(AppFlow.fetchFocalProduct.asyncErrorAction(null, 'Fetching products error'));
  },
  errorAction: (error: AjaxResponse<unknown>): Observable<unknown> => (
    handleError(error, AppFlow.fetchFocalProduct.asyncErrorAction)
  ),
  requestInjector: (request: AnyObject, action: AnyObject): AnyObject => {
    const asyncAction: AsyncParamAction = (action as AsyncParamAction);
    const params: UnknownRecord = (asyncAction.param as UnknownRecord);
    const productCodes: string[] = params.productCodes as string[];
    let release: string|undefined;
    if (isStringNonEmpty(params.release)) {
      release = params.release as string;
    }
    return {
      ...request,
      ...NeonGraphQL.getGraphqlAjaxRequest(buildProductQuery(productCodes, release)),
    };
  },
});

const fetchFocalSiteEpic = EpicService.createEpicFromProps<AppActionType, BaseStoreAppState>({
  ofTypeFilter: AppActions.FETCH_FOCAL_SITE,
  takeUntilTypeFilter: AppActions.RESET_FETCH_FOCAL_SITE,
  request: {
    method: 'POST',
    url: '',
    crossDomain: true,
    withCredentials: NeonEnvironment.requireCors(),
    headers: { 'Content-Type': 'application/json' },
    responseType: 'json',
  },
  workingAction: AppFlow.fetchFocalSite.asyncWorkingAction,
  successAction: (
    response: AjaxResponse<unknown> | AjaxResponse<unknown>[],
    action?: AppActionType,
  ): Observable<unknown> => {
    const resolved: UnknownRecord = resolveAny(response as never, 'response');
    if (exists(resolved) && exists(resolved.data)) {
      return of(AppFlow.fetchFocalSite.asyncCompletedAction(resolved));
    }
    return of(AppFlow.fetchFocalSite.asyncErrorAction(null, 'Fetching site error'));
  },
  errorAction: (error: AjaxResponse<unknown>): Observable<unknown> => (
    handleError(error, AppFlow.fetchFocalSite.asyncErrorAction)
  ),
  requestInjector: (request: AnyObject, action: AnyObject): AnyObject => {
    const asyncAction: AsyncParamAction = (action as AsyncParamAction);
    const params: UnknownRecord = (asyncAction.param as UnknownRecord);
    const siteCode: string = params.siteCode as string;
    let release: string|undefined;
    if (isStringNonEmpty(params.release)) {
      release = params.release as string;
    }
    return {
      ...request,
      ...NeonGraphQL.getGraphqlAjaxRequest(buildSiteQuery(siteCode, release)),
    };
  },
});

const fetchFocalProductReleaseDoiEpic = EpicService.createEpicFromProps<AppActionType, BaseStoreAppState>({
  ofTypeFilter: AppActions.FETCH_FOCAL_PRODUCT_RELEASE_DOI,
  takeUntilTypeFilter: AppActions.RESET_FETCH_FOCAL_PRODUCT_RELEASE_DOI,
  request: {
    method: 'GET',
    url: '',
    crossDomain: true,
    withCredentials: NeonEnvironment.requireCors(),
    responseType: 'json',
  },
  workingAction: AppFlow.fetchFocalProductReleaseDoi.asyncWorkingAction,
  successAction: (
    response: AjaxResponse<unknown> | AjaxResponse<unknown>[],
    action?: AppActionType,
  ): Observable<unknown> => {
    const resolved: UnknownRecord = resolveAny(response as never, 'response');
    if (exists(resolved) && exists(resolved.data)) {
      return of(AppFlow.fetchFocalProductReleaseDoi.asyncCompletedAction(resolved));
    }
    return of(AppFlow.fetchFocalProductReleaseDoi.asyncErrorAction(
      null,
      'Fetching product release doi error',
    ));
  },
  errorAction: (error: AjaxResponse<unknown>): Observable<unknown> => (
    handleError(error, AppFlow.fetchFocalProductReleaseDoi.asyncErrorAction)
  ),
  requestInjector: (request: AnyObject, action: AnyObject): AnyObject => {
    const asyncAction: AsyncParamAction = (action as AsyncParamAction);
    const params: UnknownRecord = (asyncAction.param as UnknownRecord);
    const productCode: string = params.productCode as string;
    const release: string = params.release as string;
    return {
      ...request,
      url: `${NeonEnvironment.getFullApiPath('products')}/${productCode}/dois/${release}`,
    };
  },
});

const fetchFocalProductReleaseTombAvaEpic = EpicService.createEpicFromProps<AppActionType, BaseStoreAppState>({
  ofTypeFilter: AppActions.FETCH_FOCAL_PRODUCT_RELEASE_TOMB_AVA,
  takeUntilTypeFilter: AppActions.RESET_FETCH_FOCAL_PRODUCT_RELEASE_TOMB_AVA,
  request: {
    method: 'GET',
    url: '',
    crossDomain: true,
    withCredentials: NeonEnvironment.requireCors(),
    responseType: 'json',
  },
  workingAction: AppFlow.fetchFocalProductReleaseTombAva.asyncWorkingAction,
  successAction: (
    response: AjaxResponse<unknown> | AjaxResponse<unknown>[],
    action?: AppActionType,
  ): Observable<unknown> => {
    const resolved: UnknownRecord = resolveAny(response as never, 'response');
    if (exists(resolved) && exists(resolved.data)) {
      return of(AppFlow.fetchFocalProductReleaseTombAva.asyncCompletedAction(resolved));
    }
    return of(AppFlow.fetchFocalProductReleaseTombAva.asyncErrorAction(
      null,
      'Fetching product release tombstone availability error',
    ));
  },
  errorAction: (error: AjaxResponse<unknown>): Observable<unknown> => (
    handleError(error, AppFlow.fetchFocalProductReleaseTombAva.asyncErrorAction)
  ),
  requestInjector: (request: AnyObject, action: AnyObject): AnyObject => {
    const asyncAction: AsyncParamAction = (action as AsyncParamAction);
    const params: UnknownRecord = (asyncAction.param as UnknownRecord);
    const productCode: string = params.productCode as string;
    const release: string = params.release as string;
    const path = `/${productCode}/${release}/tombstone-data-availability`;
    return {
      ...request,
      url: `${NeonEnvironment.getFullApiPath('products')}${path}`,
    };
  },
});

export {
  fetchProductsEpic,
  fetchReleasesEpic,
  fetchSitesEpic,
  fetchBundlesEpic,
  fetchFocalProductEpic,
  fetchFocalSiteEpic,
  fetchFocalProductReleaseDoiEpic,
  fetchFocalProductReleaseTombAvaEpic,
};
