import React, { useMemo, Suspense, useEffect } from 'react';
import { Dispatch, AnyAction } from 'redux';
import { useDispatch, useSelector } from 'react-redux';
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
import { exists, existsNonEmpty } from 'portal-core-components/lib/util/typeUtil';
import { AnyObject, Nullable } from 'portal-core-components/lib/types/core';

import TombstoneNotice from '../release/TombstoneNotice';
import AppStateSelector from '../../selectors/app';
import AppFlow from '../../actions/flows/app';
import { AvailabilitySectionState } from '../states/AppStates';
import { DataProduct, DataProductReleaseTombAva } from '../../types/store';
import { useStyles } from '../../styles/overlay';
import { StylesHook } from '../../types/styles';
import {
  AvailableDateRange,
  computeAvailableDateRange,
  computeDateRange,
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

const useAvailabilitySelector = (): AvailabilitySectionState => useSelector(
  AppStateSelector.availability,
);

const AvailabilitySection: React.FC = (): JSX.Element => {
  const state: AvailabilitySectionState = useAvailabilitySelector();
  const classes: Record<string, string> = useStyles(Theme);
  const componentClasses: Record<string, string> = useComponentStyles(Theme);
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
    || ((focalProductReleaseTombAvaFetchState === AsyncStateType.WORKING) || fetchProductReleaseTombAva);
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

  const renderSummary = (): JSX.Element => {
    if ((siteCodes.length <= 0) && isLoading) {
      return skeleton;
    }
    if ((siteCodes.length <= 0) && isComplete) {
      return (<React.Fragment />);
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
      <Grid item xs={12}>
        <TombstoneNotice />
      </Grid>
    );
  };

  return (
    <div id="availability" className={classes.section}>
      <Typography variant="h4" component="h2" gutterBottom>Availability</Typography>
      <Grid container className={componentClasses.infoContainer}>
        <Grid item xs={12} className={componentClasses.infoTextContainer}>
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

const AvailabilitySectionMemo = (): JSX.Element => (
  useMemo(
    () => (<AvailabilitySection />),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [useAvailabilitySelector()],
  )
);

export default AvailabilitySectionMemo;
