import React, { useMemo, Suspense } from 'react';
import { useSelector } from 'react-redux';
import moment from 'moment';

import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';
import Skeleton from '@material-ui/lab/Skeleton';
import {
  makeStyles,
  createStyles,
  Theme as MuiTheme,
} from '@material-ui/core/styles';

import Theme from 'portal-core-components/lib/components/Theme/Theme';
import InfoCard from 'portal-core-components/lib/components/Card/InfoCard';

import RouteService from 'portal-core-components/lib/service/RouteService';
import { AsyncStateType } from 'portal-core-components/lib/types/asyncFlow';
import { exists } from 'portal-core-components/lib/util/typeUtil';
import { AnyObject } from 'portal-core-components/lib/types/core';

import AppStateSelector from '../../selectors/app';
import { SiteAvailabilitySectionState } from '../states/AppStates';
import { Site } from '../../types/store';
import { useStyles } from '../../styles/overlay';
import { StylesHook } from '../../types/styles';
import {
  AvailableDateRange,
  computeAvailableDateRangeSite,
} from '../../util/availabilityUtil';

const DataProductAvailability: React.ExoticComponent<AnyObject> = React.lazy(
  () => import('portal-core-components/lib/components/DataProductAvailability/DataProductAvailability'),
);

const useComponentStyles: StylesHook = makeStyles((muiTheme: MuiTheme) =>
  // eslint-disable-next-line implicit-arrow-linebreak
  createStyles({
    sidebarDivider: {
      margin: muiTheme.spacing(3, 0),
    },
    infoContainer: {
      margin: muiTheme.spacing(0, 0, 2, 0),
    },
    infoTextContainer: {
      margin: muiTheme.spacing(0, 0, 2, 0),
    },
    summaryStyle: {
      color: muiTheme.palette.grey[500],
      lineHeight: '1em',
      marginBottom: muiTheme.spacing(1),
    },
  })) as StylesHook;

const useAvailabilitySelector = (): SiteAvailabilitySectionState => useSelector(
  AppStateSelector.siteAvailability,
);

const SiteAvailabilitySection: React.FC = (): JSX.Element => {
  const state: SiteAvailabilitySectionState = useAvailabilitySelector();
  const classes: Record<string, string> = useStyles(Theme);
  const componentClasses: Record<string, string> = useComponentStyles(Theme);
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

  const renderSummary = (): JSX.Element => {
    if ((dataProducts.length <= 0) && isLoading) {
      return skeleton;
    }
    if ((dataProducts.length <= 0) && isComplete) {
      return (<React.Fragment />);
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
        <Grid item xs={12} className={componentClasses.infoTextContainer}>
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
        <Grid item xs={12}>
          {renderSummary()}
        </Grid>
      </Grid>
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
