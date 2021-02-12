import React from 'react';

import NeonPage from 'portal-core-components/lib/components/NeonPage';

import PrototypeContext from './PrototypeContext';
import SkeletonDataset from './components/SkeletonDataset';

const {
  APP_STATUS,
  usePrototypeContextState,
} = PrototypeContext;

const PrototypePage = () => {
  const [state, dispatch] = usePrototypeContextState();

  const {
    app: { status: appStatus, error: appError },
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

  return (
    <NeonPage
      title="Prototype Data"
      breadcrumbHomeHref="https://www.neonscience.org/"
      breadcrumbs={[]}
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
        <div>
          foo
        </div>
      )}
    </NeonPage>
  );
};

export default PrototypePage;
