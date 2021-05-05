/* eslint-disable @typescript-eslint/no-unsafe-return */

import { AnyAction } from 'redux';
import { ajax } from 'rxjs/ajax';
import {
  combineEpics,
  createEpicMiddleware,
  EpicMiddleware,
} from 'redux-observable';

import { EpicDependencies } from 'portal-core-components/lib/types/epic';
import { fetchProductsEpic } from './app';

export const getCombinedEpics = (): unknown => (
  combineEpics(
    fetchProductsEpic,
  )
);

export const getEpicMiddleware = (): EpicMiddleware<AnyAction> => {
  const dependencies: EpicDependencies = {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    ajax,
  };
  const epicMiddleware = createEpicMiddleware({
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    dependencies,
  });
  return epicMiddleware;
};
