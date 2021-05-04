import React, { useEffect, useRef } from 'react';

import debounce from 'lodash/debounce';

import { makeStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

import Theme from 'portal-core-components/lib/components/Theme';

import PrototypeContext from '../PrototypeContext';
import Dataset from './Dataset';
import Sort from './Sort';

const { usePrototypeContextState } = PrototypeContext;

const useStyles = makeStyles((theme) => ({
  lazyLoader: {
    margin: theme.spacing(5, 5, 0, 5),
    textAlign: 'center',
  },
  lazyLoaderTitle: {
    color: theme.palette.grey[400],
    marginBottom: theme.spacing(3),
  },
  showing: {
    fontSize: '1.25rem',
    fontWeight: 500,
    color: theme.palette.grey[500],
  },
  showingContainer: {
    display: 'flex',
    alignItems: 'center',
  },
}));

const DEBOUNCE_MILLISECONDS = 100;
const SCROLL_PADDING = 400;

const ExploreDatasets = () => {
  const classes = useStyles(Theme);
  const [state, dispatch] = usePrototypeContextState();

  const {
    currentDatasets: { order: datasetsOrder },
    scrollCutoff,
    filtersApplied,
  } = state;

  // How many datasets are showing
  const filtered = filtersApplied.length ? 'filtered' : 'total';
  const plural = datasetsOrder.length === 1 ? '' : 's';
  let showing = (datasetsOrder.length > scrollCutoff)
    ? `Showing first ${scrollCutoff} of ${datasetsOrder.length} ${filtered} dataset${plural}`
    : `Showing all ${datasetsOrder.length} ${filtered} dataset${plural}`;
  if (!datasetsOrder.length) { showing = 'No datasets match current filters'; }

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
    <div>
      <Grid container spacing={4} style={{ marginBottom: Theme.spacing(3) }}>
        <Grid item xs={12} sm={6} className={classes.showingContainer}>
          <Typography variant="h5" component="h3" className={classes.showing}>{showing}</Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Sort />
        </Grid>
      </Grid>
      <div id="data-presentation">
        {datasetsOrder.length === 0 ? (
          <div style={{ margin: Theme.spacing(5), textAlign: 'center' }}>
            <Typography variant="h6" style={{ color: Theme.palette.grey[400] }}>
              Try a less restrictive combination of filters to see prototype datasets.
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
          display: (datasetsOrder.length <= scrollCutoff ? 'none' : 'block'),
        }}
      >
        <Typography variant="h6" className={classes.lazyLoaderTitle}>
          Loading more datasets...
        </Typography>
        <CircularProgress disableShrink />
      </div>
    </div>
  );
};

export default ExploreDatasets;
