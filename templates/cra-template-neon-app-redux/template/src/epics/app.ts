/* eslint-disable import/prefer-default-export */

import { Observable, of } from 'rxjs';
import { AjaxResponse } from 'rxjs/internal/observable/dom/AjaxObservable';

import NeonGraphQL from 'portal-core-components/lib/components/NeonGraphQL/NeonGraphQL';
import EpicService from 'portal-core-components/lib/flow/EpicService';
import { AnyObject, UnknownRecord } from 'portal-core-components/lib/types/core';
import { exists } from 'portal-core-components/lib/util/typeUtil';

import { AppActionType } from '../actions/actionTypes';
import { handleError } from './helpers';
import AppActions from '../actions/app';
import AppFlow from '../actions/flows/app';
import { BaseStoreAppState } from '../types/store';
import { resolveAny } from '../util/typeUtil';

const productsQuery = `query Products {
  products {
    productCode
    productName
    productDescription
  }
}`;

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

export {
  fetchProductsEpic,
};
