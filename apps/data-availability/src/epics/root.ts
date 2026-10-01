import { UnknownAction } from 'redux';
import { ajax } from 'rxjs/ajax';
import {
  combineEpics,
  createEpicMiddleware,
  type Epic,
  type EpicMiddleware,
} from 'redux-observable';

import { EpicDependencies } from '@neonscience/portal-core-components/types/epic';

import { StoreRootState } from '../types/store';
import {
  fetchProductsEpic,
  fetchReleasesEpic,
  fetchSitesEpic,
  fetchBundlesEpic,
  fetchFocalProductEpic,
  fetchFocalSiteEpic,
  fetchFocalProductReleaseDoiEpic,
  fetchFocalProductReleaseTombAvaEpic,
} from './app';

type RootEpic = Epic<
  UnknownAction,
  UnknownAction,
  StoreRootState,
  EpicDependencies
>;

export const getCombinedEpics = (): RootEpic => combineEpics(
  fetchProductsEpic,
  fetchReleasesEpic,
  fetchSitesEpic,
  fetchBundlesEpic,
  fetchFocalProductEpic,
  fetchFocalSiteEpic,
  fetchFocalProductReleaseDoiEpic,
  fetchFocalProductReleaseTombAvaEpic,
);

export const getEpicMiddleware = (): EpicMiddleware<
  UnknownAction,
  UnknownAction,
  StoreRootState,
  EpicDependencies
> => {
  const dependencies: EpicDependencies = {
    ajax,
  };
  return createEpicMiddleware<
    UnknownAction,
    UnknownAction,
    StoreRootState,
    EpicDependencies
  >({
    dependencies,
  });
};
