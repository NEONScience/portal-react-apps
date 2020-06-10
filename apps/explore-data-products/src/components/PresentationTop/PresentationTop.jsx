import React, { useEffect, useRef } from 'react';

import { makeStyles } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import CircularProgress from "@material-ui/core/CircularProgress";
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import Typography from "@material-ui/core/Typography";

import debounce from 'lodash/debounce';

import NeonPage from 'portal-core-components/lib/components/NeonPage';
import Theme from 'portal-core-components/lib/components/Theme';

import DataHeader from '../DataHeader/DataHeader';
import PresentationData from '../PresentationData/PresentationData';
import PresentationSort from '../PresentationSort/PresentationSort';
import PresentationFilter from '../PresentationFilter/PresentationFilter';
import DataVisualizationDialog from '../DataVisualizationDialog/DataVisualizationDialog';

import { FetchStateType } from '../../actions/actions';

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
    appFetchState,
    onFetchAppState,
    productOrder,
    scrollCutoff,
    onIncrementScrollCutoff,
    activeDataVisualization,
    onChangeActiveDataVisualization,
  } = props;

  useEffect(onFetchAppState, [onFetchAppState]);

  const belowMd = useMediaQuery(Theme.breakpoints.down('sm'));

  let loading = null;
  let error = null;
  let title = 'Explore Data Products';
  switch (appFetchState) {
    case FetchStateType.FULLFILLED:
      // Set above as default values
      break;
    case FetchStateType.WORKING:
      loading = 'Analyzing data products...';
      break;
    case FetchStateType.FAILED:
    default:
      error = 'An error was encountered communicating with the API. Please try again.';
      break;
  }
  const skeleton = loading || error;

  const drillProps = {...props, skeleton};

  const breadcrumbs = [
    { name: 'Data Products' },
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

  return (
    <NeonPage
      loading={loading}
      error={error}
      title={title}
      breadcrumbs={breadcrumbs}
    >
      <DataVisualizationDialog
        products={products}
        component={activeDataVisualization.component}
        productCode={activeDataVisualization.productCode}
        onChangeActiveDataVisualization={onChangeActiveDataVisualization}
      />
      <DataHeader {...drillProps} />
      {belowMd ? null : (
        <Divider style={{ marginBottom: Theme.spacing(3) }} />
      )}
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <PresentationFilter {...drillProps} />
        </Grid>
        <Grid item xs={12} md={8}>
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
        </Grid>
      </Grid>
    </NeonPage>
  );
};

export default PresentationTop;
