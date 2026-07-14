import React, { useMemo, Suspense, type JSX } from 'react';
import { useSelector } from 'react-redux';
import moment from 'moment';

import Grid from '@mui/material/Grid2';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Skeleton from '@mui/material/Skeleton';

import InfoCard from 'portal-core-components/lib/components/Card/InfoCard';

import RouteService from 'portal-core-components/lib/service/RouteService';
import { AsyncStateType } from 'portal-core-components/lib/types/asyncFlow';
import { exists } from 'portal-core-components/lib/util/typeUtil';
import { AnyObject } from 'portal-core-components/lib/types/core';
import { makeStyles } from 'portal-core-components/lib/components/Theme/makeStyles';
import { NeonTheme } from 'portal-core-components/lib/components/Theme/types';

import AppStateSelector from '../../selectors/app';
import { SiteAvailabilitySectionState } from '../states/AppStates';
import { Site } from '../../types/store';
import useStyles from '../../styles/overlay';
import {
  AvailableDateRange,
  computeAvailableDateRangeSite,
} from '../../util/availabilityUtil';

const DataProductAvailability: React.ExoticComponent<AnyObject> = React.lazy(
  () => import('portal-core-components/lib/components/DataProductAvailability/DataProductAvailability'),
);

const useComponentStyles = makeStyles()((theme: NeonTheme) => ({
  sidebarDivider: {
    margin: theme.spacing(3, 0),
  },
  infoContainer: {
    margin: theme.spacing(0, 0, 2, 0),
  },
  infoTextContainer: {
    margin: theme.spacing(0, 0, 2, 0),
  },
  summaryStyle: {
    color: theme.palette.grey[500],
    lineHeight: '1em',
    marginBottom: theme.spacing(1),
  },
}));

const useAvailabilitySelector = (): SiteAvailabilitySectionState => useSelector(
  AppStateSelector.siteAvailability,
);

const SiteAvailabilitySection: React.FC = (): JSX.Element => {
  const state: SiteAvailabilitySectionState = useAvailabilitySelector();
  const { classes } = useStyles();
  const { classes: componentClasses } = useComponentStyles();
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
    <Skeleton variant="rectangular" width="100%" height={400} className={classes.skeleton} />
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

  const renderSummary = (): JSX.Element | null => {
    if ((dataProducts.length <= 0) && isLoading) {
      return skeleton;
    }
    if ((dataProducts.length <= 0) && isComplete) {
      return null;
    }
    const availableProducts = dataProducts.length;
    const availableDates: AvailableDateRange = computeAvailableDateRangeSite(
      focalSite as Site,
    );
    const startMonth = moment(`${availableDates.start}-01`).format('MMMM YYYY');
    const endMonth = moment(`${availableDates.end}-01`).format('MMMM YYYY');
    return (
      <div>
        <Typography variant="h6" className={componentClasses.summaryStyle}>
          {`${startMonth} – ${endMonth}`}
        </Typography>
        <Typography variant="h6" className={componentClasses.summaryStyle}>
          {`${availableProducts} total product${availableProducts === 1 ? '' : 's'}`}
        </Typography>
      </div>
    );
  };

  return (
    <div id="site-availability-view" className={classes.section}>
      <Typography variant="h4" component="h2" gutterBottom>Site Availability</Typography>
      <Grid container className={componentClasses.infoContainer}>
        <Grid size={{ xs: 12 }} className={componentClasses.infoTextContainer}>
          <Typography variant="subtitle1">
            The chart shows the available data products and months where data are available as
            well as distinguishes beween release data and provisional data. When viewing
            a specific release, only those data that are available for that release are
            displayed. See&nbsp;
            <Link
              target="_blank"
              rel="noreferrer noopener"
              href={RouteService.getDataRevisionsReleasePath()}
            >
              Data Product Revisions and Releases
            </Link>
            &nbsp;for more details.
          </Typography>
        </Grid>
        <Grid size={{ xs: 12 }}>
          {renderSummary()}
        </Grid>
      </Grid>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
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
    // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/use-memo
    [useAvailabilitySelector()],
  )
);

export default SiteAvailabilitySectionMemo;
