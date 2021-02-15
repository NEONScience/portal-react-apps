import React, { useRef } from 'react';

import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import NeonPage from 'portal-core-components/lib/components/NeonPage';
import Theme from 'portal-core-components/lib/components/Theme';

import PrototypeContext from './PrototypeContext';
import SkeletonDataset from './components/SkeletonDataset';
import Dataset from './components/Dataset';
import Sort from './components/Sort';
import Search from './components/Search';

const {
  APP_STATUS,
  usePrototypeContextState,
} = PrototypeContext;

const useStyles = makeStyles((theme) => ({
  filters: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(4),
  },
}));

const PrototypePage = () => {
  const classes = useStyles(Theme);
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

  // Refs for filter inputs that we can't directly control due to poor performance
  // but on which we want to set values in certain cases
  // Used to set search input value when provided from URL (controlling kills typing performance)
  const searchRef = useRef(null);

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
        <>
          <div className={classes.filters}>
            <Sort />
            <Search searchRef={searchRef} />
          </div>
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
        </>
      )}
    </NeonPage>
  );
};

export default PrototypePage;
