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
import { AvailabilitySectionState } from '../states/AppStates';
import { DataProduct } from '../../types/store';
import { useStyles } from '../../styles/overlay';

const DataProductAvailability: React.ExoticComponent<AnyObject> = React.lazy(
  () => import('portal-core-components/lib/components/DataProductAvailability/DataProductAvailability'),
);

const useAvailabilitySelector = (): AvailabilitySectionState => useSelector(
  AppStateSelector.availability,
);

const AvailabilitySection: React.FC = (): JSX.Element => {
  const state: AvailabilitySectionState = useAvailabilitySelector();
  const classes: Record<string, string> = useStyles(Theme);
  const {
    focalProductFetchState,
    focalProduct,
  }: AvailabilitySectionState = state;

  const isLoading = (focalProductFetchState === AsyncStateType.IDLE)
    || (focalProductFetchState === AsyncStateType.WORKING);
  const isComplete = (focalProductFetchState === AsyncStateType.FULLFILLED)
    || (focalProductFetchState === AsyncStateType.FAILED);
  const siteCodes: Record<string, unknown>[] = !exists(focalProduct)
    ? new Array<Record<string, unknown>>()
    : (focalProduct as DataProduct).siteCodes;
  const skeleton: JSX.Element = (
    <Skeleton variant="rect" width="100%" height={400} className={classes.skeleton} />
  );
  const renderAvailability = (): JSX.Element => {
    if ((siteCodes.length <= 0) && isLoading) {
      return skeleton;
    }
    if ((siteCodes.length <= 0) && isComplete) {
      return (
        <InfoCard
          title="No Data"
          message="No data available for this data product within the specified release"
        />
      );
    }
    return (
      <Suspense fallback={skeleton}>
        <DataProductAvailability
          delineateRelease
          view="ungrouped"
          sortMethod="states"
          sortDirection="ASC"
          siteCodes={siteCodes}
        />
      </Suspense>
    );
  };
  return (
    <div id="availability" className={classes.section}>
      <Typography variant="h4" component="h2" gutterBottom>Availability</Typography>
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

const AvailabilitySectionMemo = (): JSX.Element => (
  useMemo(
    () => (<AvailabilitySection />),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [useAvailabilitySelector()],
  )
);

export default AvailabilitySectionMemo;
