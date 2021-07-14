import React from 'react';

import NeonPage from 'portal-core-components/lib/components/NeonPage';

import RouteService from 'portal-core-components/lib/service/RouteService';

import PrototypeContext from './PrototypeContext';
import DatasetFilters from './components/DatasetFilters';
import DatasetDetails from './components/DatasetDetails';
import DatasetDetailsSkeleton from './components/DatasetDetailsSkeleton';
import ExploreDatasets from './components/ExploreDatasets';
import ExploreDatasetsSkeleton from './components/ExploreDatasetsSkeleton';

const {
  APP_STATUS,
  usePrototypeContextState,
} = PrototypeContext;

const PrototypePage = () => {
  const [state, dispatch] = usePrototypeContextState();

  const {
    app: { status: appStatus, error: appError },
    route: { uuid: routeUuid },
  } = state;

  // Set loading and error page props
  let loading = null;
  let error = null;
  switch (appStatus) {
    case APP_STATUS.READY:
      break;
    case APP_STATUS.ERROR:
      error = appError;
      break;
    default:
      loading = `Loading Prototype Dataset${routeUuid ? '' : 's'}...`;
      break;
  }
  const skeleton = loading || error;

  // Breadcrumbs
  const breadcrumbs = [
    { name: 'Data & Samples', href: RouteService.getDataSamplesPath() },
    { name: 'Data Portal', href: RouteService.getDataSamplesDataPath() },
  ];
  if (routeUuid) {
    breadcrumbs.push({ name: 'Prototype Datasets', href: RouteService.getPrototypeDatasetsPath() });
    breadcrumbs.push({ name: routeUuid });
  } else {
    breadcrumbs.push({ name: 'Prototype Datasets' });
  }

  // Title
  let title = 'Prototype Datasets';
  if (routeUuid) {
    const { datasets: { [routeUuid]: dataset } } = state;
    title = (typeof dataset === 'undefined' ? 'Prototype Dataset' : dataset.projectTitle);
  }

  let showSidebar = true;
  let pageContent = null;
  if (skeleton) {
    if (routeUuid) {
      showSidebar = false;
      pageContent = <DatasetDetailsSkeleton />;
    } else {
      pageContent = <ExploreDatasetsSkeleton />;
    }
  } else {
    // eslint-disable-next-line no-lonely-if
    if (routeUuid) {
      showSidebar = false;
      pageContent = <DatasetDetails uuid={routeUuid} />;
    } else {
      pageContent = <ExploreDatasets />;
    }
  }

  return (
    <NeonPage
      title={title}
      breadcrumbHomeHref={RouteService.getWebHomePath()}
      breadcrumbs={breadcrumbs}
      loading={loading}
      error={error}
      sidebarWidth={showSidebar ? 340 : undefined}
      sidebarContent={showSidebar ? <DatasetFilters /> : undefined}
      sidebarUnsticky={showSidebar ? true : undefined}
      NeonContextProviderProps={{
        whenFinal: (neonContextState) => {
          dispatch({ type: 'storeFinalizedNeonContextState', neonContextState });
        },
      }}
    >
      {pageContent}
    </NeonPage>
  );
};

export default PrototypePage;
