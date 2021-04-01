import React, { useEffect, useRef } from 'react';

import debounce from 'lodash/debounce';

import { makeStyles } from '@material-ui/core/styles';
import Accordion from '@material-ui/core/Accordion';
import AccordionActions from '@material-ui/core/AccordionActions';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

import ClearIcon from '@material-ui/icons/Clear';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import Theme from 'portal-core-components/lib/components/Theme';

import PrototypeContext from '../PrototypeContext';
import Dataset from './Dataset';
import FilterScienceTeam from './FilterScienceTeam';
import FilterSearch from './FilterSearch';
import FilterTheme from './FilterTheme';
import FilterTimeRange from './FilterTimeRange';
import Sort from './Sort';

const { usePrototypeContextState } = PrototypeContext;

const useStyles = makeStyles((theme) => ({
  accordion: {
    marginBottom: `${theme.spacing(5)}px !important`,
  },
  accordionSummary: {
    '& div': {
      fontSize: '1.25rem',
    },
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
    <div>
      <Accordion className={classes.accordion}>
        <AccordionSummary className={classes.accordionSummary} expandIcon={<ExpandMoreIcon />}>
          Search / Filter Datasets
        </AccordionSummary>
        <AccordionDetails className={classes.filters}>
          <Grid container spacing={5}>
            <Grid item xs={12} sm={6} md={6} lg={3}>
              <FilterSearch searchRef={searchRef} />
            </Grid>
            <Grid item xs={12} sm={6} md={6} lg={3}>
              <FilterTimeRange />
            </Grid>
            <Grid item xs={12} sm={6} md={6} lg={3}>
              <FilterScienceTeam />
            </Grid>
            <Grid item xs={12} sm={6} md={6} lg={3}>
              <FilterTheme />
            </Grid>
          </Grid>
        </AccordionDetails>
        <AccordionActions>
          <Button
            color="primary"
            variant="contained"
            startIcon={<ClearIcon />}
            disabled={!filtersApplied.length}
            onClick={() => {
              // Clear the search field value directly (not through state) because
              // the input field is not controlled (controlling it destroys performance).
              if (searchRef.current) { searchRef.current.querySelector('input').value = ''; }
              dispatch({ type: 'resetAllFilters' });
            }}
          >
            Reset All Filters
          </Button>
        </AccordionActions>
      </Accordion>
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
