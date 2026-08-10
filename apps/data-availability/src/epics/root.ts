import { AnyAction } from 'redux';
import { ajax } from 'rxjs/ajax';
import {
  combineEpics,
  createEpicMiddleware,
  EpicMiddleware,
} from 'redux-observable';

import { EpicDependencies } from '@neonscience/portal-core-components/types/epic';
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

export const getCombinedEpics = (): unknown => (
  combineEpics(
    fetchProductsEpic,
    fetchReleasesEpic,
    fetchSitesEpic,
    fetchBundlesEpic,
    fetchFocalProductEpic,
    fetchFocalSiteEpic,
    fetchFocalProductReleaseDoiEpic,
    fetchFocalProductReleaseTombAvaEpic,
  )
);

export const getEpicMiddleware = (): EpicMiddleware<AnyAction> => {
  const dependencies: EpicDependencies = {
    ajax,
  };
  const epicMiddleware = createEpicMiddleware({
    dependencies,
  });
  return epicMiddleware;
};
