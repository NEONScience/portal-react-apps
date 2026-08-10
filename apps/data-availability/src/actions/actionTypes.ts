import { AsyncActionType } from '@neonscience/portal-core-components/types/asyncFlow';
import { AppActionTypes } from './app';

export type AppActionType = AsyncActionType;

export type AnyActionType = (
  AppActionType
  | AppActionTypes
);
