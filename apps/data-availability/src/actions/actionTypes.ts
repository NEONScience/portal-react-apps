import { AsyncActionType } from 'portal-core-components/lib/types/asyncFlow';
import { AppActionTypes } from './app';

export type AppActionType = AsyncActionType;

export type AnyActionType = (
  AppActionType
  | AppActionTypes
);
