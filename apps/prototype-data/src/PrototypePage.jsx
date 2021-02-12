import React from 'react';

import Typography from '@material-ui/core/Typography';

import NeonPage from 'portal-core-components/lib/components/NeonPage';
import Theme from 'portal-core-components/lib/components/Theme';

import PrototypeContext from './PrototypeContext';
import SkeletonDataset from './components/SkeletonDataset';
import Dataset from './components/Dataset';

const {
  APP_STATUS,
  usePrototypeContextState,
} = PrototypeContext;

const PrototypePage = () => {
  const [state, dispatch] = usePrototypeContextState();

  const {
    app: { status: appStatus, error: appError },
    currentDatasets: { order: datasetsOrder },
    scrollCutoff,
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
        <div id="data-presentation">
          {datasetsOrder.length === 0 ? (
            <div style={{ margin: Theme.spacing(5), textAlign: 'center' }}>
              <Typography variant="h6" style={{ color: Theme.palette.grey[400] }}>
                No prototype datasets found to match current filters.
              </Typography>
            </div>
          ) : null}
          {datasetsOrder.slice(0, scrollCutoff).map((uuid) => (
            <Dataset key={uuid} uuid={uuid} />
          ))}
        </div>
      )}
    </NeonPage>
  );
};

export default PrototypePage;
