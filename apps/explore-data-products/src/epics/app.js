import { createEpicMiddleware } from "redux-observable";
import { of, forkJoin, concat } from "rxjs";
import { ajax } from "rxjs/ajax";
import { switchMap, mergeMap, map, catchError } from "rxjs/operators";
import { ofType } from "redux-observable";

import NeonEnvironment from 'portal-core-components/lib/components/NeonEnvironment';
import NeonGraphQL from 'portal-core-components/lib/components/NeonGraphQL';
import NeonApi from 'portal-core-components/lib/components/NeonApi';

import {
  FETCH_APP_STATE,
  fetchAppStateComplete,
  fetchAppStateFailed,
  fetchAppStateWorking
} from "../actions/actions";

/**
 * Gets the AJAX observable to subscribe to
 * @param {*} ajax
 */
const buildObservable = (ajax) => {
  const requests = [];
  const requestMap = {};
  if (NeonEnvironment.useGraphql) {
    requestMap.products = requests.length;
    requests.push(NeonGraphQL.getAllDataProducts());
  } else {
    requestMap.products = requests.length;
    requests.push(ajax({
      method: "GET",
      crossDomain: true,
      url: NeonEnvironment.getFullApiPath('products'),
      responseType: "json",
      headers: NeonApi.getApiTokenHeader(),
    }));
  }
  if (NeonEnvironment.showAopViewer) {
    requestMap.aopProducts = requests.length;
    requests.push(buildAopViewerProductsObservable(ajax));
  }
  return forkJoin(requests).pipe(
    mergeMap(response => {
      // Handle Products - successful response required
      let productsData = null;
      if (!response[requestMap.products] || !response[requestMap.products].response) {
        return of(fetchAppStateFailed());
      } else {
        if (NeonEnvironment.useGraphql) {
          productsData = response[requestMap.products].response.data.products || [];
        } else {
          productsData = response[requestMap.products].response.data || [];
        }
      }
      // Handle AOP Products - if failed or not executed proceed with empty value
      // This request only tells us which products can run the third-party AOP Viewer and
      // the endpoint is maintained by a third party. Its failure should not kill the page.
      let aopProductsData = [];
      if (NeonEnvironment.showAopViewer && response[requestMap.aopProducts] && response[requestMap.aopProducts].response) {
        aopProductsData = response[requestMap.aopProducts].response.data || [];
      }
      return of(fetchAppStateComplete(productsData, aopProductsData));
    }),
    catchError(error => {
      let message = error.xhr ? error.xhr.response : null;
      return of(fetchAppStateFailed(error, message));
    })
  );
}

/**
 * Builds the AJAX observable for fetching AOP data viewer products
 * This allows us to separate the error handling of AOP viewer call
 * from the other app state observables in the forkJoin to prevent
 * the AOP viewer request failure to prevent the app state to
 * be processed.
 * @param {*} ajax
 */
const buildAopViewerProductsObservable = (ajax) => {
  return ajax({
    method: "GET",
    crossDomain: true,
    url: NeonEnvironment.getVisusProductsBaseUrl(),
    responseType: "json"
  }).pipe(
    map(response => response),
    catchError(() => of(null))
  );
}

/**
 * Epic for fetching the initial app state from products and sites API
 * The forkJoin operator will run the requests in parallel, join when completed,
 * return results as an array indexed by the order passed in to the forJoin operator
 * @param {*} action$ stream of actions
 * @param {*} state$ stream of state
 * @param {*} dependencies$ injected dependencies
 */
export const fetchAppStateEpic = (action$, state$, { ajax }) => {
  return action$.pipe(
    ofType(FETCH_APP_STATE),
    switchMap(() =>
      concat(
        of(fetchAppStateWorking()),
        buildObservable(ajax)
      )
    )
  );
}
export const getFetchProductsByReleaseEpic = () => (action$, state$, { ajax }) => (
  action$.pipe(
    ofType(FETCH_APP_STATE),
    switchMap(() =>
      concat(
        of(fetchAppStateWorking()),
        buildObservable(ajax)
      )
    )
  )
);


/**
   Export function to generate the entire combined middleware
*/
export const getEpicMiddleware = () => (
  createEpicMiddleware({
    dependencies: { ajax },
  })
);
