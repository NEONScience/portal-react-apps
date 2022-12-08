import React, { useEffect, useRef, Suspense } from 'react';

import { makeStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';

import Skeleton from '@material-ui/lab/Skeleton';

import debounce from 'lodash/debounce';

import NeonPage from 'portal-core-components/lib/components/NeonPage';
import Theme from 'portal-core-components/lib/components/Theme';

import RouteService from 'portal-core-components/lib/service/RouteService';

import ExploreContext from './ExploreContext';

import PresentationData from './components/PresentationData';
import PresentationSort from './components/PresentationSort';
import PresentationFilter from './components/PresentationFilter';
import DataVisualizationDialog from './components/DataVisualizationDialog';

import { APP_STATUS } from './util/stateUtil';
import { LATEST_AND_PROVISIONAL } from './util/filterUtil';

const DataHeader = React.lazy(() => import('./components/DataHeader'));

const useStyles = makeStyles((theme) => ({
  lazyLoader: {
    margin: theme.spacing(5, 5, 0, 5),
    textAlign: 'center',
  },
  lazyLoaderTitle: {
    color: theme.palette.grey[400],
    marginBottom: theme.spacing(3),
  },
}));

const DEBOUNCE_MILLISECONDS = 100;
const SCROLL_PADDING = 400;

const ExplorePage = (props) => {
  const classes = useStyles(Theme);

  // Deconstruct state
  const [state, dispatch] = ExploreContext.useExploreContextState();
  const {
    appStatus,
    scrollCutoff,
    currentProducts: { release: currentRelease, order: productOrder },
  } = state;

  // Set loading and error page props
  let loading = null;
  let error = null;
  switch (appStatus) {
    case APP_STATUS.READY:
      break;
    case APP_STATUS.ERROR:
      error = 'An error was encountered communicating with the API. Please try again.';
      break;
    default:
      loading = currentRelease === LATEST_AND_PROVISIONAL
        ? 'Loading data products...'
        : `Loading data products for release ${currentRelease}...`;
      break;
  }

  // Establish props we drill down to lower order components
  const skeleton = !!(loading || error);
  const drillProps = { ...props, skeleton };

  // Breadcrumbs
  const breadcrumbs = [
    { name: 'Data & Samples', href: RouteService.getDataSamplesPath() },
    { name: 'Data Portal', href: RouteService.getDataSamplesDataPath() },
    { name: 'Explore Data Products' },
  ];

  // Scroll-based Lazy Rendering Management
  const lazyLoaderRef = useRef(null);
  const scrollHandler = debounce(() => {
    if (productOrder.length <= scrollCutoff) { return; }
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

  /**
     Main Page Render
  */
  return (
    <NeonPage
      loading={loading}
      error={error}
      title="Explore Data Products"
      breadcrumbHomeHref={RouteService.getWebHomePath()}
      breadcrumbs={breadcrumbs}
      sidebarWidth={340}
      sidebarContent={<PresentationFilter {...drillProps} />}
      sidebarUnsticky
      NeonContextProviderProps={{
        whenFinal: (neonContextState) => {
          dispatch({ type: 'storeFinalizedNeonContextState', neonContextState });
        },
      }}
    >
      <DataVisualizationDialog />
      <Suspense fallback={<Skeleton variant="rect" width="100%" height={160} />}>
        <DataHeader {...drillProps} />
      </Suspense>
      <PresentationSort {...drillProps} />
      <PresentationData {...drillProps} />
      <div
        id="lazy-loader"
        ref={lazyLoaderRef}
        className={classes.lazyLoader}
        style={{ display: (skeleton || productOrder.length <= scrollCutoff ? 'none' : 'block') }}
      >
        <Typography variant="h6" className={classes.lazyLoaderTitle}>
          Loading more data products...
        </Typography>
        <CircularProgress disableShrink />
      </div>
    </NeonPage>
  );
};

export default ExplorePage;
