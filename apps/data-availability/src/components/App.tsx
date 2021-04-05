import React, { useEffect, useCallback, useMemo } from 'react';
import { Dispatch, AnyAction } from 'redux';
import { batch, useDispatch, useSelector } from 'react-redux';

import Grid from '@material-ui/core/Grid';
import Divider from '@material-ui/core/Divider';
import {
  makeStyles,
  createStyles,
  Theme as MuiTheme,
} from '@material-ui/core/styles';

import NeonPage from 'portal-core-components/lib/components/NeonPage/NeonPage';
import ReleaseFilter from 'portal-core-components/lib/components/ReleaseFilter/ReleaseFilter';
import SidebarFilter from 'portal-core-components/lib/components/SidebarFilter/SidebarFilter';
import Theme from 'portal-core-components/lib/components/Theme/Theme';
import { AsyncStateType } from 'portal-core-components/lib/types/asyncFlow';
import { exists, isStringNonEmpty } from 'portal-core-components/lib/util/typeUtil';
import { Nullable } from 'portal-core-components/lib/types/core';

import DataProductSelect from './controls/DataProductSelect';
import AvailabilitySection from './availability/AvailabilitySection';
import LocationsSection from './availability/LocationsSection';
import SiteSelect from './controls/SiteSelect';
import SiteAvailabilitySection from './availability/SiteAvailabilitySection';

import AppStateSelector from '../selectors/app';
import AppFlow from '../actions/flows/app';
import { AppComponentState } from './states/AppStates';
import {
  DataProduct,
  Release,
  Site,
  SelectOption,
} from '../types/store';
import { StylesHook } from '../types/styles';
import { AppActionCreator } from '../actions/app';

const VIEW_BY_FILTER_DESCRIPTION = 'View availability in a data product centric or site centric mode';

const useStyles: StylesHook = makeStyles((muiTheme: MuiTheme) =>
  // eslint-disable-next-line implicit-arrow-linebreak
  createStyles({
    sidebarDivider: {
      margin: muiTheme.spacing(3, 0),
    },
  })) as StylesHook;

const useAppSelector = (): AppComponentState => useSelector(
  AppStateSelector.app,
);

const App: React.FC = (): JSX.Element => {
  const state: AppComponentState = useAppSelector();
  const classes: Record<string, string> = useStyles(Theme);
  const dispatch: Dispatch<AnyAction> = useDispatch();
  const {
    productsFetchState,
    sitesFetchState,
    releaseFetchState,
    releases,
    selectedProduct,
    selectedRelease,
    selectedSite,
    selectedViewMode,
    viewModes,
  }: AppComponentState = state;

  const isLoading = (productsFetchState === AsyncStateType.WORKING)
    || (sitesFetchState === AsyncStateType.WORKING)
    || (releaseFetchState === AsyncStateType.WORKING);

  useEffect(
    () => {
      batch(() => {
        dispatch(AppFlow.fetchProducts.asyncAction());
        dispatch(AppFlow.fetchSites.asyncAction());
        dispatch(AppFlow.fetchReleases.asyncAction());
      });
    },
    [dispatch],
  );

  const handleChangeViewModeCb = useCallback(
    (nextViewModeCb: SelectOption): void => {
      dispatch(AppActionCreator.setSelectedViewMode(nextViewModeCb));
    },
    [dispatch],
  );

  const handleChangeCb = useCallback(
    (productCb: Nullable<DataProduct>, siteCb: Nullable<Site>, releaseCb: Nullable<Release>) => (
      batch(() => {
        dispatch(AppActionCreator.setSelectedRelease(releaseCb));
        if (exists(productCb)) {
          dispatch(AppFlow.fetchFocalProduct.asyncAction({
            productCode: (productCb as DataProduct).productCode,
            release: releaseCb?.release,
          }));
        }
        if (exists(siteCb)) {
          dispatch(AppFlow.fetchFocalSite.asyncAction({
            siteCode: (siteCb as Site).siteCode,
            release: releaseCb?.release,
          }));
        }
      })
    ),
    [dispatch],
  );

  const title = 'Data Availability';
  const breadcrumbs = [
    { name: 'Data & Samples', href: 'https://www.neonscience.org/data-samples/' },
    { name: 'Data Portal', href: 'https://www.neonscience.org/data-samples/data' },
    { name: title },
  ];
  const sidebarContent: JSX.Element = (
    <React.Fragment>
      <SidebarFilter
        title="View By:"
        skeleton={isLoading}
        selected={selectedViewMode.value}
        tooltipText={VIEW_BY_FILTER_DESCRIPTION}
        helperText={VIEW_BY_FILTER_DESCRIPTION}
        values={viewModes}
        onChange={(selected: string): void => {
          const nextViewMode: SelectOption = viewModes.find((value: SelectOption): boolean => (
            value.value === selected
          )) || viewModes[0];
          handleChangeViewModeCb(nextViewMode);
        }}
      />
      <Divider className={classes.sidebarDivider} />
      <ReleaseFilter
        showGenerationDate
        title="Release"
        skeleton={isLoading}
        releases={releases}
        selected={selectedRelease ? selectedRelease.release : null}
        onChange={(selected: string): void => {
          const nextRelease: Nullable<Release> = !isStringNonEmpty(selected)
            ? null
            : releases.find((value: Release): boolean => (value.release === selected));
          handleChangeCb(selectedProduct, selectedSite, nextRelease);
        }}
      />
    </React.Fragment>
  );
  let sidebarLinks = [];
  switch (selectedViewMode.value) {
    case 'Site':
      sidebarLinks = [
        {
          name: 'Availability',
          hash: '#site-availability-view',
          component: SiteAvailabilitySection,
        },
        {
          name: 'Available Sites',
          hash: '#sites',
          component: LocationsSection,
        },
      ];
      break;
    case 'DataProduct':
    default:
      sidebarLinks = [
        {
          name: 'Availability',
          hash: '#availability',
          component: AvailabilitySection,
        },
        {
          name: 'Available Sites',
          hash: '#sites',
          component: LocationsSection,
        },
      ];
      break;
  }

  const renderContent = (): JSX.Element => {
    switch (selectedViewMode.value) {
      case 'Site':
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <SiteSelect />
            </Grid>
            <Grid item xs={12}>
              <SiteAvailabilitySection />
            </Grid>
            <Grid item xs={12}>
              <LocationsSection />
            </Grid>
          </Grid>
        );
      case 'DataProduct':
      default:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <DataProductSelect />
            </Grid>
            <Grid item xs={12}>
              <AvailabilitySection />
            </Grid>
            <Grid item xs={12}>
              <LocationsSection />
            </Grid>
          </Grid>
        );
    }
  };

  return (
    <NeonPage
      title={title}
      loading={isLoading ? 'Loading Availability...' : undefined}
      breadcrumbHomeHref="https://www.neonscience.org/"
      breadcrumbs={breadcrumbs}
      sidebarLinks={sidebarLinks}
      sidebarLinksAdditionalContent={sidebarContent}
    >
      {renderContent()}
    </NeonPage>
  );
};

const AppMemo = (): JSX.Element => (
  useMemo(
    () => (<App />),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [useAppSelector()],
  )
);

export default AppMemo;
