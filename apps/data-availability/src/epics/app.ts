/* eslint-disable import/prefer-default-export */

import { Observable, of } from 'rxjs';
import { AjaxResponse } from 'rxjs/internal/observable/dom/AjaxObservable';

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
  }
}`;
const buildProductQuery = (productCode: string, release?: string): string => {
  const hasRelease = isStringNonEmpty(release);
  const releaseArgument = !hasRelease ? '' : `, release: "${release as string}"`;
  const availableReleases = hasRelease
    ? ''
    : `availableReleases {
      release
      availableMonths
    }`;
  return `query Products {
    product (productCode: "${productCode}"${releaseArgument}) {
      productCode
      productName
      siteCodes {
        siteCode
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
    crossDomain: true,
    headers: { 'Content-Type': 'application/json' },
    responseType: 'json',
  },
  workingAction: AppFlow.fetchProducts.asyncWorkingAction,
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  successAction: (
    response: AjaxResponse | AjaxResponse[],
    action?: AppActionType,
  ): Observable<unknown> => {
    const singleResponse: AjaxResponse = (response as AjaxResponse);
    const resolved: UnknownRecord = resolveAny(singleResponse as never, 'response');
    if (exists(resolved) && exists(resolved.data)) {
      return of(AppFlow.fetchProducts.asyncCompletedAction(resolved));
    }
    return of(AppFlow.fetchProducts.asyncErrorAction(null, 'Fetching products error'));
  },
  errorAction: (error: AjaxResponse): Observable<unknown> => (
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
    crossDomain: true,
    headers: { 'Content-Type': 'application/json' },
    responseType: 'json',
  },
  workingAction: AppFlow.fetchSites.asyncWorkingAction,
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  successAction: (
    response: AjaxResponse | AjaxResponse[],
    action?: AppActionType,
  ): Observable<unknown> => {
    const singleResponse: AjaxResponse = (response as AjaxResponse);
    const resolved: UnknownRecord = resolveAny(singleResponse as never, 'response');
    if (exists(resolved) && exists(resolved.data)) {
      return of(AppFlow.fetchSites.asyncCompletedAction(resolved));
    }
    return of(AppFlow.fetchSites.asyncErrorAction(null, 'Fetching sites error'));
  },
  errorAction: (error: AjaxResponse): Observable<unknown> => (
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
    responseType: 'json',
    url: NeonEnvironment.getFullApiPath('releases'),
  },
  workingAction: AppFlow.fetchReleases.asyncWorkingAction,
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  successAction: (
    response: AjaxResponse | AjaxResponse[],
    action?: AppActionType,
  ): Observable<unknown> => {
    const singleResponse: AjaxResponse = (response as AjaxResponse);
    const resolved: UnknownRecord = resolveAny(singleResponse as never, 'response');
    if (exists(resolved) && exists(resolved.data)) {
      return of(AppFlow.fetchReleases.asyncCompletedAction(resolved));
    }
    return of(AppFlow.fetchReleases.asyncErrorAction(null, 'Fetching releases error'));
  },
  errorAction: (error: AjaxResponse): Observable<unknown> => (
    handleError(error, AppFlow.fetchReleases.asyncErrorAction)
  ),
});

const fetchFocalProductEpic = EpicService.createEpicFromProps<AppActionType, BaseStoreAppState>({
  ofTypeFilter: AppActions.FETCH_FOCAL_PRODUCT,
  takeUntilTypeFilter: AppActions.RESET_FETCH_FOCAL_PRODUCT,
  request: {
    method: 'POST',
    crossDomain: true,
    headers: { 'Content-Type': 'application/json' },
    responseType: 'json',
  },
  workingAction: AppFlow.fetchFocalProduct.asyncWorkingAction,
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  successAction: (
    response: AjaxResponse | AjaxResponse[],
    action?: AppActionType,
  ): Observable<unknown> => {
    const singleResponse: AjaxResponse = (response as AjaxResponse);
    const resolved: UnknownRecord = resolveAny(singleResponse as never, 'response');
    if (exists(resolved) && exists(resolved.data)) {
      return of(AppFlow.fetchFocalProduct.asyncCompletedAction(resolved));
    }
    return of(AppFlow.fetchFocalProduct.asyncErrorAction(null, 'Fetching products error'));
  },
  errorAction: (error: AjaxResponse): Observable<unknown> => (
    handleError(error, AppFlow.fetchFocalProduct.asyncErrorAction)
  ),
  requestInjector: (request: AnyObject, action: AnyObject): AnyObject => {
    const asyncAction: AsyncParamAction = (action as AsyncParamAction);
    const params: UnknownRecord = (asyncAction.param as UnknownRecord);
    const productCode: string = params.productCode as string;
    let release: string|undefined;
    if (isStringNonEmpty(params.release)) {
      release = params.release as string;
    }
    return {
      ...request,
      ...NeonGraphQL.getGraphqlAjaxRequest(buildProductQuery(productCode, release)),
    };
  },
});

export {
  fetchProductsEpic,
  fetchReleasesEpic,
  fetchSitesEpic,
  fetchFocalProductEpic,
};
