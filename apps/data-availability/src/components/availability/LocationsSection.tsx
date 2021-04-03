import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';

import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Skeleton from '@material-ui/lab/Skeleton';
import Alert from '@material-ui/lab/Alert';
import AlertTitle from '@material-ui/lab/AlertTitle';

import Theme from 'portal-core-components/lib/components/Theme/Theme';
import SiteMap from 'portal-core-components/lib/components/SiteMap';
import { AsyncStateType } from 'portal-core-components/lib/types/asyncFlow';
import { exists } from 'portal-core-components/lib/util/typeUtil';
import { UnknownRecord } from 'portal-core-components/lib/types/core';

import AppStateSelector from '../../selectors/app';
import { LocationsSectionState } from '../states/AppStates';
import { DataProduct, Site } from '../../types/store';
import { useStyles } from '../../styles/overlay';

const useLocationsSelector = (): LocationsSectionState => useSelector(
  AppStateSelector.locations,
);

const LocationsSection: React.FC = (): JSX.Element => {
  const state: LocationsSectionState = useLocationsSelector();
  const classes: Record<string, string> = useStyles(Theme);
  const {
    focalProductFetchState,
    focalProduct,
    sitesFetchState,
    sites,
  }: LocationsSectionState = state;

  const isLoading = (focalProductFetchState === AsyncStateType.IDLE)
    || (focalProductFetchState === AsyncStateType.WORKING)
    || (sitesFetchState === AsyncStateType.WORKING);
  const isComplete = (focalProductFetchState === AsyncStateType.FULLFILLED)
    || (focalProductFetchState === AsyncStateType.FAILED);
  const siteCodes: Record<string, unknown>[] = !exists(focalProduct)
    ? new Array<Record<string, unknown>>()
    : (focalProduct as DataProduct).siteCodes;
  const searchSiteCodes: string[] = siteCodes
    .map((value: Record<string, unknown>): string => (
      value.siteCode as string
    ));
  const renderLocations = (): JSX.Element => {
    if (((siteCodes.length <= 0) && isLoading) || isLoading) {
      return <Skeleton variant="rect" width="100%" height={600} className={classes.skeleton} />;
    }
    if ((siteCodes.length <= 0) && isComplete) {
      return (
        <Alert severity="info">
          <AlertTitle>Info</AlertTitle>
          No data available for this Data Product within the specified Release
        </Alert>
      );
    }
    const manualLocationData: UnknownRecord[] = sites
      .filter((site: Site): boolean => searchSiteCodes.includes(site.siteCode))
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
      <SiteMap manualLocationData={manualLocationData} />
    );
  };
  return (
    <div id="locations" className={classes.section}>
      <Typography variant="h4" component="h2" gutterBottom>Locations</Typography>
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
