import React, { useEffect, useRef } from 'react';

import debounce from 'lodash/debounce';

import { makeStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';
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
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(4),
  },
  lazyLoader: {
    margin: theme.spacing(5, 5, 0, 5),
    textAlign: 'center',
  },
  lazyLoaderTitle: {
    color: theme.palette.grey[400],
    marginBottom: theme.spacing(3),
  },
  showing: {
    marginBottom: theme.spacing(4),
    fontSize: '0.85rem',
    color: theme.palette.grey[500],
  },
}));

const DEBOUNCE_MILLISECONDS = 100;
const SCROLL_PADDING = 400;

const PrototypePage = () => {
  const classes = useStyles(Theme);
  const [state, dispatch] = usePrototypeContextState();

  const {
    app: { status: appStatus, error: appError },
    currentDatasets: { order: datasetsOrder },
    route: { uuid: routeUuid },
    scrollCutoff,
    filtersApplied,
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

  // How many datasets are showing
  const filtered = filtersApplied.length ? 'filtered' : 'total';
  let showing = (datasetsOrder.length > scrollCutoff)
    ? `Showing first ${scrollCutoff} of ${datasetsOrder.length} ${filtered} datasets`
    : `Showing all ${datasetsOrder.length} ${filtered} datasets`;
  if (!datasetsOrder.length) { showing = ''; }

  // Refs for filter inputs that we can't directly control due to poor performance
  // but on which we want to set values in certain cases
  // Used to set search input value when provided from URL (controlling kills typing performance)
  const searchRef = useRef(null);

  // Scroll-based Lazy Rendering Management
  const lazyLoaderRef = useRef(null);
  const scrollHandler = debounce(() => {
    if (datasetsOrder.length <= scrollCutoff) { return; }
    // Y-offset for the TOP of the area in view
    const scrollOffset = (
      window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0
    );
    // Y-offset for the BOTTOM of the area in view
    const scrollBottom = window.innerHeight + scrollOffset;
    // Y-offset for the absolute bottom of the document
    const documentBottom = document.documentElement.offsetHeight;
    // Y-offset for the TOP of the lazy loader
    const lazyLoaderOffset = lazyLoaderRef.current
      ? lazyLoaderRef.current.offsetTop
      : documentBottom - SCROLL_PADDING;
    if (scrollBottom > lazyLoaderOffset) {
      dispatch({ type: 'incrementScrollCutoff' });
    }
  }, DEBOUNCE_MILLISECONDS);
  useEffect(() => {
    window.addEventListener('scroll', scrollHandler);
    window.addEventListener('resize', scrollHandler);
    return () => {
      window.removeEventListener('scroll', scrollHandler);
      window.removeEventListener('resize', scrollHandler);
    };
  });

  return (
    <NeonPage
      title="Prototype Datasets"
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
        <>
          <div className={classes.filters}>
            <Sort />
            <Search searchRef={searchRef} />
          </div>
          <div className={classes.showing}>
            <Typography variant="subtitle2">{showing}</Typography>
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
          <div
            id="lazy-loader"
            ref={lazyLoaderRef}
            className={classes.lazyLoader}
            style={{
              display: (skeleton || datasetsOrder.length <= scrollCutoff ? 'none' : 'block'),
            }}
          >
            <Typography variant="h6" className={classes.lazyLoaderTitle}>
              Loading more datasets...
            </Typography>
            <CircularProgress disableShrink />
          </div>
        </>
      )}
    </NeonPage>
  );
};

export default PrototypePage;
