import React, { useRef } from 'react';

import { makeStyles } from '@material-ui/core/styles';
import Hidden from '@material-ui/core/Hidden';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Collapse from '@material-ui/core/Collapse';
import useMediaQuery from '@material-ui/core/useMediaQuery';

import ClearIcon from '@material-ui/icons/Clear';
import FilterIcon from '@material-ui/icons/FilterList';

import Theme from 'portal-core-components/lib/components/Theme';

import PrototypeContext from '../PrototypeContext';
import FilterScienceTeam from './FilterScienceTeam';
import FilterSearch from './FilterSearch';
import FilterTheme from './FilterTheme';
import FilterTimeRange from './FilterTimeRange';

import { FILTER_LABELS } from '../filterUtil';

const { APP_STATUS, usePrototypeContextState } = PrototypeContext;

const useStyles = makeStyles((theme) => ({
  title: {
    fontWeight: 600,
    [theme.breakpoints.up('md')]: {
      marginBottom: theme.spacing(2),
    },
    [theme.breakpoints.down('sm')]: {
      marginRight: theme.spacing(1.5),
      fontSize: '1.3rem',
    },
  },
  filterContent: {
    [theme.breakpoints.up('md')]: {
      width: '276px',
    },
    [theme.breakpoints.down('sm')]: {
      marginRight: theme.spacing(3),
    },
    '& > div:not(:last-child)': {
      marginBottom: theme.spacing(3.5),
    },
  },
  resetFiltersContainer: {
    margin: theme.spacing(0, 0, 3, 0),
  },
  collapse: {
    maxHeight: 'calc(100vh - 216px)',
    flex: '1 1 auto',
    overflowY: 'auto',
  },
  twoColumns: {
    display: 'flex',
    marginBottom: 'unset',
    '& > :first-child': {
      marginRight: theme.spacing(3),
    },
    '& > :last-child': {
      marginLeft: theme.spacing(3),
    },
  },
  column: {
    flex: '50%',
    '& > div:not(:last-child)': {
      marginBottom: theme.spacing(3.5),
    },
  },
}));

const DatasetFilters = () => {
  const classes = useStyles(Theme);
  const [state, dispatch] = usePrototypeContextState();

  const {
    app: { status: appStatus },
    filtersApplied,
    filtersVisible,
  } = state;

  const belowMd = useMediaQuery(Theme.breakpoints.down('sm'));
  const visible = filtersVisible || !belowMd;
  const skeleton = [
    APP_STATUS.INITIALIZING,
    APP_STATUS.FETCHING,
    APP_STATUS.ERROR,
  ].includes(appStatus);

  let filterSummary = 'no filters applied';
  if (filtersApplied.length) {
    const filterLabels = filtersApplied.map((key) => FILTER_LABELS[key]);
    filterSummary = filterLabels.join(', ');
    if (filtersApplied.length === 2) { filterSummary = filterLabels.join(' and '); }
    if (filtersApplied.length > 2) {
      const lastComma = filterSummary.lastIndexOf(',') + 1;
      filterSummary = `${filterSummary.slice(0, lastComma)} and${filterSummary.slice(lastComma)}`;
    }
    filterSummary = `by ${filterSummary}`;
  }

  const title = (
    <Typography variant="h4" component="h2" className={classes.title}>Filter</Typography>
  );
  // Refs for filter inputs that we can't directly control due to poor performance
  // but on which we want to set values in certain cases
  // Used to set search input value when provided from URL (controlling kills typing performance)
  const searchRef = useRef(null);
  const filterSearch = (
    <FilterSearch skeleton={skeleton} searchRef={searchRef} />
  );

  const filterContent = (
    <div className={classes.filterContent}>
      <Button
        fullWidth
        className={classes.resetFiltersContainer}
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
      {filterSearch}
      <FilterTimeRange skeleton={skeleton} />
      <FilterScienceTeam skeleton={skeleton} />
      <FilterTheme skeleton={skeleton} />
    </div>
  );

  return (
    <div
      id="filter-presentation"
      data-selenium="prototype-data--page.filters"
      style={{ position: 'relative' }}
    >
      <Hidden smDown>
        {title}
      </Hidden>
      <Hidden mdUp>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ flex: 1 }}>
            {title}
            <div className={classes.summary}>
              {filterSummary}
            </div>
          </div>
          <Tooltip
            style={{ flex: 0 }}
            placement="left"
            title={`${filtersVisible ? 'Collapse' : 'Expand'} filters`}
          >
            <IconButton onClick={() => { dispatch({ type: 'toggleFilterVisiblity' }); }}>
              {filtersVisible ? <ClearIcon /> : <FilterIcon />}
            </IconButton>
          </Tooltip>
        </div>
      </Hidden>
      {belowMd ? (
        <Collapse
          in={visible}
          className={classes.collapse}
          style={{ marginTop: Theme.spacing(visible ? 3 : 0) }}
        >
          {filterContent}
        </Collapse>
      ) : filterContent}
    </div>
  );
};

export default DatasetFilters;
