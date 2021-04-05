import React, { useMemo, Suspense } from 'react';
import { useSelector } from 'react-redux';

import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Skeleton from '@material-ui/lab/Skeleton';

import Theme from 'portal-core-components/lib/components/Theme/Theme';
import InfoCard from 'portal-core-components/lib/components/Card/InfoCard';
import { AsyncStateType } from 'portal-core-components/lib/types/asyncFlow';
import { exists } from 'portal-core-components/lib/util/typeUtil';
import { AnyObject } from 'portal-core-components/lib/types/core';

import AppStateSelector from '../../selectors/app';
import { SiteAvailabilitySectionState } from '../states/AppStates';
import { Site } from '../../types/store';
import { useStyles } from '../../styles/overlay';

const DataProductAvailability: React.ExoticComponent<AnyObject> = React.lazy(
  () => import('portal-core-components/lib/components/DataProductAvailability/DataProductAvailability'),
);

const useAvailabilitySelector = (): SiteAvailabilitySectionState => useSelector(
  AppStateSelector.siteAvailability,
);

const SiteAvailabilitySection: React.FC = (): JSX.Element => {
  const state: SiteAvailabilitySectionState = useAvailabilitySelector();
  const classes: Record<string, string> = useStyles(Theme);
  const {
    focalSiteFetchState,
    focalSite,
  }: SiteAvailabilitySectionState = state;

  const isLoading = (focalSiteFetchState === AsyncStateType.IDLE)
    || (focalSiteFetchState === AsyncStateType.WORKING);
  const isComplete = (focalSiteFetchState === AsyncStateType.FULLFILLED)
    || (focalSiteFetchState === AsyncStateType.FAILED);
  const dataProducts: Record<string, unknown>[] = !exists(focalSite)
    ? new Array<Record<string, unknown>>()
    : (focalSite as Site).dataProducts;
  const skeleton: JSX.Element = (
    <Skeleton variant="rect" width="100%" height={400} className={classes.skeleton} />
  );
  const renderAvailability = (): JSX.Element => {
    if ((dataProducts.length <= 0) && isLoading) {
      return skeleton;
    }
    if ((dataProducts.length <= 0) && isComplete) {
      return (
        <InfoCard
          title="No Data"
          message="No data available for this site within the specified release"
        />
      );
    }
    return (
      <Suspense fallback={skeleton}>
        <DataProductAvailability
          delineateRelease
          view="products"
          dataProducts={dataProducts}
        />
      </Suspense>
    );
  };
  return (
    <div id="site-availability-view" className={classes.section}>
      <Typography variant="h4" component="h2" gutterBottom>Site Availability</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <div className={isLoading ? classes.overlay : undefined}>
            {renderAvailability()}
          </div>
        </Grid>
      </Grid>
    </div>
  );
};

const SiteAvailabilitySectionMemo = (): JSX.Element => (
  useMemo(
    () => (<SiteAvailabilitySection />),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [useAvailabilitySelector()],
  )
);

export default SiteAvailabilitySectionMemo;
