import React, { useEffect, useMemo, Suspense } from 'react';
import { Dispatch, AnyAction } from 'redux';
import { useDispatch, useSelector } from 'react-redux';

import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Skeleton from '@material-ui/lab/Skeleton';
import {
  makeStyles,
  createStyles,
  Theme as MuiTheme,
} from '@material-ui/core/styles';

import Theme from 'portal-core-components/lib/components/Theme/Theme';
import InfoCard from 'portal-core-components/lib/components/Card/InfoCard';
import { AsyncStateType } from 'portal-core-components/lib/types/asyncFlow';
import { AnyObject, UnknownRecord } from 'portal-core-components/lib/types/core';

import AppStateSelector from '../../selectors/app';
import { LocationsSectionState } from '../states/AppStates';
import { useStyles } from '../../styles/overlay';
import { StylesHook } from '../../types/styles';
import { Site } from '../../types/store';
import { AppActionCreator } from '../../actions/app';

const SiteMap: React.ExoticComponent<AnyObject> = React.lazy(
  () => import('portal-core-components/lib/components/SiteMap/SiteMap'),
);

const useComponentStyles: StylesHook = makeStyles((muiTheme: MuiTheme) =>
  // eslint-disable-next-line implicit-arrow-linebreak
  createStyles({
    infoContainer: {
      margin: muiTheme.spacing(0, 0, 4, 0),
    },
  })) as StylesHook;

const useLocationsSelector = (): LocationsSectionState => useSelector(
  AppStateSelector.locations,
);

const LocationsSection: React.FC = (): JSX.Element => {
  const state: LocationsSectionState = useLocationsSelector();
  const dispatch: Dispatch<AnyAction> = useDispatch();
  const classes: Record<string, string> = useStyles(Theme);
  const componentClasses: Record<string, string> = useComponentStyles(Theme);
  const {
    fetchState,
    siteCodes,
    sitesFetchState,
    sites,
    viewModeSwitching,
    selectedViewMode,
  }: LocationsSectionState = state;

  const isLoading = (fetchState === AsyncStateType.IDLE)
    || (fetchState === AsyncStateType.WORKING)
    || (sitesFetchState === AsyncStateType.WORKING);
  const isComplete = (fetchState === AsyncStateType.FULLFILLED)
    || (fetchState === AsyncStateType.FAILED);

  useEffect(
    () => {
      if (viewModeSwitching) {
        dispatch(AppActionCreator.resetViewModeSwitching());
      }
    },
    [dispatch, viewModeSwitching],
  );

  const skeleton: JSX.Element = (
    <Skeleton variant="rect" width="100%" height={600} className={classes.skeleton} />
  );
  const renderLocations = (): JSX.Element => {
    if (((siteCodes.length <= 0) && isLoading) || isLoading) {
      return skeleton;
    }
    if (viewModeSwitching) {
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
    const manualLocationData: UnknownRecord[] = sites
      .filter((site: Site): boolean => siteCodes.includes(site.siteCode))
      .map((site: Site): UnknownRecord => ({
        manualLocationType: 'PROTOTYPE_SITE',
        domain: site.domainCode,
        state: site.stateCode,
        siteCode: site.siteCode,
        siteName: site.siteDescription,
        latitude: site.siteLatitude,
        longitude: site.siteLongitude,
      }));
    return (
      <Suspense fallback={skeleton}>
        <SiteMap manualLocationData={manualLocationData} />
      </Suspense>
    );
  };

  const renderInfo = (): JSX.Element => {
    if (viewModeSwitching) {
      return skeleton;
    }
    if ((siteCodes.length <= 0) && isComplete) {
      return (<React.Fragment />);
    }
    if (!selectedViewMode) {
      return (<React.Fragment />);
    }
    let text = '';
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    switch (selectedViewMode.value) {
      case 'DataProduct':
        text = `The site map shows the field sites where data are available for the
          selected data product.`;
        break;
      case 'Site':
        text = 'The site map shows the currently selected field site.';
        break;
      default:
        break;
    }
    return (
      <Grid container className={componentClasses.infoContainer}>
        <Grid item xs={12} className={componentClasses.infoTextContainer}>
          <Typography variant="subtitle1">
            {text}
          </Typography>
        </Grid>
      </Grid>
    );
  };

  return (
    <div id="sites" className={classes.section}>
      <Typography variant="h4" component="h2" gutterBottom>Available Sites</Typography>
      {renderInfo()}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <div className={isLoading ? classes.overlay : undefined}>
            {renderLocations()}
          </div>
        </Grid>
      </Grid>
    </div>
  );
};

const LocationsSectionMemo = (): JSX.Element => (
  useMemo(
    () => (<LocationsSection />),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [useLocationsSelector()],
  )
);

export default LocationsSectionMemo;
