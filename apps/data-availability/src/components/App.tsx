import React, { useEffect, useCallback, useMemo } from 'react';
import { Dispatch, AnyAction } from 'redux';
import { batch, useDispatch, useSelector } from 'react-redux';

import Grid from '@material-ui/core/Grid';

import NeonPage from 'portal-core-components/lib/components/NeonPage/NeonPage';
import ReleaseFilter from 'portal-core-components/lib/components/ReleaseFilter/ReleaseFilter';
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
import { DataProduct, Release, Site } from '../types/store';
import { AppActionCreator } from '../actions/app';

const useAppSelector = (): AppComponentState => useSelector(
  AppStateSelector.app,
);

const App: React.FC = (): JSX.Element => {
  const state: AppComponentState = useAppSelector();
  const dispatch: Dispatch<AnyAction> = useDispatch();
  const {
    productsFetchState,
    sitesFetchState,
    releaseFetchState,
    releases,
    selectedProduct,
    selectedRelease,
    selectedSite,
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
  );
  const sidebarLinks = [
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
    {
      name: 'Site Availability View',
      hash: '#site-availability-view',
      component: SiteAvailabilitySection,
    },
  ];

  return (
    <NeonPage
      title={title}
      loading={isLoading ? 'Loading Products...' : undefined}
      breadcrumbHomeHref="https://www.neonscience.org/"
      breadcrumbs={breadcrumbs}
      sidebarLinks={sidebarLinks}
      sidebarLinksAdditionalContent={sidebarContent}
    >
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
        <Grid item xs={12}>
          <SiteSelect />
        </Grid>
        <Grid item xs={12}>
          <SiteAvailabilitySection />
        </Grid>
      </Grid>
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
