import React, { useEffect, useRef } from 'react';

import { makeStyles } from '@material-ui/core/styles';
import CircularProgress from "@material-ui/core/CircularProgress";
import Typography from "@material-ui/core/Typography";

import debounce from 'lodash/debounce';

import NeonPage from 'portal-core-components/lib/components/NeonPage';
import NeonContext from 'portal-core-components/lib/components/NeonContext';
import Theme from 'portal-core-components/lib/components/Theme';

import DataHeader from '../DataHeader/DataHeader';
import PresentationData from '../PresentationData/PresentationData';
import PresentationSort from '../PresentationSort/PresentationSort';
import PresentationFilter from '../PresentationFilter/PresentationFilter';
import DataVisualizationDialog from '../DataVisualizationDialog/DataVisualizationDialog';

import { BuildStateType } from '../../actions/actions';

const useStyles = makeStyles(theme => ({
  lazyLoader: {
    margin: Theme.spacing(5, 5, 0, 5),
    textAlign: 'center',
  },
  lazyLoaderTitle: {
    color: Theme.palette.grey[400],
    marginBottom: Theme.spacing(3),
  },
}));

const DEBOUNCE_MILLISECONDS = 100;
const SCROLL_PADDING = 400;

const PresentationTop = (props) => {
  const classes = useStyles(Theme);

  const {
    products,
    onFetchAppState,
    productOrder,
    scrollCutoff,
    onIncrementScrollCutoff,
    activeDataVisualization,
    onChangeActiveDataVisualization,
    neonContextState: storedNeonContextState,
    onChangeNeonContextState,
    appBuildState,
  } = props;

  // Effect - Trigger the initial app fetch
  useEffect(onFetchAppState, [onFetchAppState]);

  // Neon Context State
  const [latestNeonContextState] = NeonContext.useNeonContextState();

  // Effect - look for any changes to the NeonContext's initialization; stream them into local state
  useEffect(() => {
    if (
      !storedNeonContextState || !latestNeonContextState
        || ['isActive', 'isFinal', 'hasError'].every(k => (
          storedNeonContextState[k] === latestNeonContextState[k]
        ))
    ) { return; }
    onChangeNeonContextState(latestNeonContextState);
  }, [
    storedNeonContextState,
    latestNeonContextState,
    onChangeNeonContextState,
    storedNeonContextState.isActive,
    storedNeonContextState.isFinal,
    storedNeonContextState.hasError,
    latestNeonContextState.isActive,
    latestNeonContextState.isFinal,
    latestNeonContextState.hasError,
  ]);

  let loading = null;
  let error = null;
  switch (appBuildState) {
    case BuildStateType.COMPLETE:
      // Set above as default values
      break;
    case BuildStateType.AWAITING_DATA:
      loading = 'Loading data products...';
      break;
    case BuildStateType.FAILED:
    default:
      error = 'An error was encountered communicating with the API. Please try again.';
      break;
  }
  const skeleton = loading || error;

  const drillProps = {...props, skeleton};

  const breadcrumbs = [
    { name: 'Data & Samples', href: 'https://www.neonscience.org/data-samples/' },
    { name: 'Data Portal', href: 'https://www.neonscience.org/data-samples/data' },
    { name: 'Explore Data Products' },
  ];

  /**
   * Scroll-based Lazy Rendering Management
   */
  const lazyLoaderRef = useRef(null);
  const scrollHandler = debounce(() => {
    if (productOrder.length <= scrollCutoff) { return; }
    // Y-offset for the TOP of the area in view
    const scrollOffset = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
    // Y-offset for the BOTTOM of the area in view
    const scrollBottom = window.innerHeight + scrollOffset;
    // Y-offset for the absolute bottom of the document
    const documentBottom = document.documentElement.offsetHeight;
    // Y-offset for the TOP of the lazy loader
    const lazyLoaderOffset = lazyLoaderRef.current
      ? lazyLoaderRef.current.offsetTop
      : documentBottom - SCROLL_PADDING;
    if (scrollBottom > lazyLoaderOffset) {
      onIncrementScrollCutoff();
    }
  }, DEBOUNCE_MILLISECONDS);
  useEffect(() => {
    window.addEventListener("scroll", scrollHandler);
    window.addEventListener("resize", scrollHandler);
    return () => {
      window.removeEventListener("scroll", scrollHandler);
      window.removeEventListener("resize", scrollHandler);
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
      breadcrumbHomeHref="https://www.neonscience.org/"
      breadcrumbs={breadcrumbs}
      sidebarContent={<PresentationFilter {...drillProps} />}
      sidebarWidth={340}
      sidebarUnsticky
    >
      <DataVisualizationDialog
        products={products}
        component={activeDataVisualization.component}
        productCode={activeDataVisualization.productCode}
        onChangeActiveDataVisualization={onChangeActiveDataVisualization}
      />
      <DataHeader {...drillProps} />
      <PresentationSort {...drillProps} />
      <PresentationData {...drillProps} />
      <div
        id="lazy-loader"
        ref={lazyLoaderRef}
        className={classes.lazyLoader}
        style={{ display: (skeleton || productOrder.length <= scrollCutoff ? 'none' : 'block')  }}
      >
        <Typography variant="h6" className={classes.lazyLoaderTitle}>
          Loading more data products...
        </Typography>
        <CircularProgress disableShrink />
      </div>
    </NeonPage>
  );
};

export default PresentationTop;
