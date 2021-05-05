import { of, Observable } from 'rxjs';
import { AjaxResponse } from 'rxjs/internal/observable/dom/AjaxObservable';

import { exists } from 'portal-core-components/lib/util/typeUtil';
import {
  Nullable,
  AnyObject,
  UnknownRecord,
} from 'portal-core-components/lib/types/core';
import { resolveAny } from '../util/typeUtil';

export type CascadeActionFunction = (param?: unknown) => AnyObject;

export const handleSuccess = (
  response: AjaxResponse,
  completed: (response: AnyObject) => AnyObject,
  error: (response: Nullable<AnyObject>) => AnyObject,
  cascadeAction?: CascadeActionFunction,
): Observable<unknown> => {
  const resolved: UnknownRecord = resolveAny(response as never, 'response');
  if (exists(resolved)
      && exists(resolved.data)
      && ((resolved.data as UnknownRecord).successful === true)) {
    return of(completed(resolved));
  }
  if (exists(resolved) && exists(resolved.error)) {
    return of(error(resolved.error as Nullable<AnyObject>));
  }
  return of(error(response));
};

export const handleSuccessObservable = (
  response: AjaxResponse,
  completed: (response: AnyObject) => Observable<unknown>,
  error: (response: Nullable<AnyObject>) => Observable<unknown>,
  cascadeAction?: CascadeActionFunction,
): Observable<unknown> => {
  const resolved: UnknownRecord = resolveAny(response as never, 'response');
  if (exists(resolved)
      && exists(resolved.data)
      && ((resolved.data as UnknownRecord).successful === true)) {
    return completed(resolved);
  }
  if (exists(resolved) && exists(resolved.error)) {
    return error(resolved.error as Nullable<AnyObject>);
  }
  return error(response);
};

export const handleError = (
  response: AjaxResponse,
  error: (response: Nullable<AnyObject>, message?: Nullable<string>) => AnyObject,
  cascadeAction?: CascadeActionFunction,
): Observable<unknown> => {
  const resolved: UnknownRecord = resolveAny(response as never, 'response');
  let appliedError: Nullable<AnyObject> = null;
  let appliedMessage: Nullable<string> = null;
  if (exists(resolved)) {
    appliedError = resolved.error as Nullable<AnyObject>;
    if (exists(appliedError) && exists((appliedError as AnyObject).message)) {
      appliedMessage = (appliedError as AnyObject).message as Nullable<string>;
    } else {
      appliedError = response;
    }
  } else {
    appliedError = response;
  }
  if (exists(cascadeAction)) {
    return of(error(appliedError, appliedMessage), (cascadeAction as CascadeActionFunction)());
  }
  return of(error(appliedError, appliedMessage));
};
