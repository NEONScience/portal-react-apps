import React, {
  useMemo,
  Suspense,
  useEffect,
  type JSX,
} from 'react';
import { Dispatch, AnyAction } from 'redux';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';

import Grid from '@mui/material/Grid2';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Skeleton from '@mui/material/Skeleton';

import InfoCard from 'portal-core-components/lib/components/Card/InfoCard';

import RouteService from 'portal-core-components/lib/service/RouteService';
import { AsyncStateType } from 'portal-core-components/lib/types/asyncFlow';
import { exists, existsNonEmpty } from 'portal-core-components/lib/util/typeUtil';
import { AnyObject, Nullable } from 'portal-core-components/lib/types/core';
import { makeStyles } from 'portal-core-components/lib/components/Theme/makeStyles';
import { NeonTheme } from 'portal-core-components/lib/components/Theme/types';

import TombstoneNotice from '../release/TombstoneNotice';
import AppStateSelector from '../../selectors/app';
import AppFlow from '../../actions/flows/app';
import { AvailabilitySectionState } from '../states/AppStates';
import { DataProduct, DataProductReleaseTombAva } from '../../types/store';
import useStyles from '../../styles/overlay';
import {
  AvailableDateRange,
  computeAvailableDateRange,
  computeDateRange,
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

const useAvailabilitySelector = (): AvailabilitySectionState => useSelector(
  AppStateSelector.availability,
);

const AvailabilitySection: React.FC = (): JSX.Element => {
  const state: AvailabilitySectionState = useAvailabilitySelector();
  const { classes } = useStyles();
  const { classes: componentClasses } = useComponentStyles();
  const dispatch: Dispatch<AnyAction> = useDispatch();
  const {
    focalProductFetchState,
    focalProduct,
    appliedRelease,
    delineateAvaRelease,
    fetchProductReleaseDoi,
    focalProductReleaseDoiFetchState,
    isTombstoned,
    fetchProductReleaseTombAva,
    focalProductReleaseTombAvaFetchState,
    focalProductReleaseTombAva,
  }: AvailabilitySectionState = state;

  const terminalStates = [AsyncStateType.IDLE, AsyncStateType.FULLFILLED, AsyncStateType.FAILED];
  const isLoading = (focalProductFetchState === AsyncStateType.IDLE)
    || (focalProductFetchState === AsyncStateType.WORKING)
    || ((focalProductReleaseDoiFetchState === AsyncStateType.WORKING) || fetchProductReleaseDoi)
    || ((focalProductReleaseTombAvaFetchState === AsyncStateType.WORKING)
      || fetchProductReleaseTombAva);
  const isComplete = ((focalProductFetchState === AsyncStateType.FULLFILLED)
      || (focalProductFetchState === AsyncStateType.FAILED))
    && terminalStates.includes(focalProductReleaseDoiFetchState)
    && terminalStates.includes(focalProductReleaseTombAvaFetchState);
  let siteCodes: Record<string, unknown>[] = !exists(focalProduct)
    ? new Array<Record<string, unknown>>()
    : (focalProduct as DataProduct).siteCodes;
  if (!existsNonEmpty(siteCodes) && exists(focalProductReleaseTombAva)) {
    const tombAva = focalProductReleaseTombAva as DataProductReleaseTombAva;
    if (existsNonEmpty(tombAva.siteCodes)) {
      siteCodes = tombAva.siteCodes;
    }
  }

  useEffect(() => {
    if (!fetchProductReleaseDoi) return;
    dispatch(AppFlow.fetchFocalProductReleaseDoi.asyncAction({
      productCode: focalProduct?.productCode,
      release: appliedRelease?.release,
    }));
  }, [
    dispatch,
    fetchProductReleaseDoi,
    focalProduct,
    appliedRelease,
  ]);
  useEffect(() => {
    if (!fetchProductReleaseTombAva) return;
    dispatch(AppFlow.fetchFocalProductReleaseTombAva.asyncAction({
      productCode: focalProduct?.productCode,
      release: appliedRelease?.release,
    }));
  }, [
    dispatch,
    fetchProductReleaseTombAva,
    focalProduct,
    appliedRelease,
  ]);

  const skeleton: JSX.Element = (
    <Skeleton variant="rectangular" width="100%" height={400} className={classes.skeleton} />
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
    let tombstoneProps = {};
    if (isTombstoned) {
      tombstoneProps = {
        availabilityStatusType: 'tombstoned',
        delineateRelease: false,
      };
    }
    return (
      <Suspense fallback={skeleton}>
        <DataProductAvailability
          delineateRelease={delineateAvaRelease}
          view="ungrouped"
          sortMethod="states"
          sortDirection="ASC"
          siteCodes={siteCodes}
          {...tombstoneProps}
        />
      </Suspense>
    );
  };

  const renderSummary = (): JSX.Element | null => {
    if ((siteCodes.length <= 0) && isLoading) {
      return skeleton;
    }
    if ((siteCodes.length <= 0) && isComplete) {
      return null;
    }
    const availableSites = siteCodes.length;
    const availableDates: AvailableDateRange = isTombstoned
      ? computeDateRange(siteCodes)
      : computeAvailableDateRange(focalProduct as DataProduct);
    const startMonth = moment(`${availableDates.start}-01`).format('MMMM YYYY');
    const endMonth = moment(`${availableDates.end}-01`).format('MMMM YYYY');
    return (
      <div>
        <Typography variant="h6" className={componentClasses.summaryStyle}>
          {`${startMonth} – ${endMonth}`}
        </Typography>
        <Typography variant="h6" className={componentClasses.summaryStyle}>
          {`${availableSites} total site${availableSites === 1 ? '' : 's'}`}
        </Typography>
      </div>
    );
  };

  const renderTombstoneRow = (): Nullable<JSX.Element> => {
    if (!isTombstoned) {
      return null;
    }
    return (
      <Grid size={{ xs: 12 }}>
        <TombstoneNotice />
      </Grid>
    );
  };

  return (
    <div id="availability" className={classes.section}>
      <Typography variant="h4" component="h2" gutterBottom>Availability</Typography>
      <Grid container className={componentClasses.infoContainer}>
        <Grid size={{ xs: 12 }} className={componentClasses.infoTextContainer}>
          <Typography variant="subtitle1">
            The chart shows the available sites and months where data are available as
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
        {renderTombstoneRow()}
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

const AvailabilitySectionMemo = (): JSX.Element => (
  useMemo(
    () => (<AvailabilitySection />),
    // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/use-memo
    [useAvailabilitySelector()],
  )
);

export default AvailabilitySectionMemo;
