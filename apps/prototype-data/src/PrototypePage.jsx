import React from 'react';

import NeonPage from 'portal-core-components/lib/components/NeonPage';

import PrototypeContext from './PrototypeContext';
import DatasetDetails from './components/DatasetDetails';
import ExploreDatasets from './components/ExploreDatasets';
import SkeletonDataset from './components/SkeletonDataset';

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
      loading = 'Loading Prototype Datasets...';
      break;
  }
  const skeleton = loading || error;

  // Breadcrumbs
  const breadcrumbs = [
    { name: 'Data & Samples', href: 'https://www.neonscience.org/data-samples/' },
    { name: 'Data Portal', href: 'https://www.neonscience.org/data-samples/data' },
  ];
  if (routeUuid) {
    breadcrumbs.push({ name: 'Prototype Datasets', href: '/prototype-datasets/' });
    breadcrumbs.push({ name: routeUuid });
  } else {
    breadcrumbs.push({ name: 'Prototype Datasets' });
  }

  // Title
  let title = 'Prototype Datasets';
  if (routeUuid) {
    const { datasets: { [routeUuid]: dataset } } = state;
    if (typeof dataset === 'undefined') { title = 'Prototype Dataset'; }
    title = dataset.projectTitle;
  }
  
  return (
    <NeonPage
      title={title}
      breadcrumbHomeHref="https://www.neonscience.org/"
      breadcrumbs={breadcrumbs}
      loading={loading}
      error={error}
      NeonContextProviderProps={{
        whenFinal: (neonContextState) => {
          dispatch({ type: 'storeFinalizedNeonContextState', neonContextState });
        },
      }}
    >
      {skeleton ? (
        <div>
          <SkeletonDataset />
          <SkeletonDataset />
          <SkeletonDataset />
          <SkeletonDataset />
          <SkeletonDataset />
        </div>
      ) : (
        routeUuid ? <DatasetDetails uuid={routeUuid} /> : <ExploreDatasets />
      )}
    </NeonPage>
  );
};

export default PrototypePage;