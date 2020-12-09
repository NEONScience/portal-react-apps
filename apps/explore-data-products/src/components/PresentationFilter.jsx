import React, { useRef } from 'react';

import { makeStyles } from '@material-ui/core/styles';
import Collapse from '@material-ui/core/Collapse';
import useMediaQuery from '@material-ui/core/useMediaQuery';

import Theme from 'portal-core-components/lib/components/Theme';

import ExploreContext from '../ExploreContext';

import FilterHeader from './FilterHeader';
import FilterResetAll from './FilterResetAll';

import FilterSearch from './Filters/FilterSearch';
import FilterRelease from './Filters/FilterRelease';
import FilterDateRange from './Filters/FilterDateRange';
import FilterDataStatus from './Filters/FilterDataStatus';
import FilterScienceTeam from './Filters/FilterScienceTeam';
import FilterState from './Filters/FilterState';
import FilterDomain from './Filters/FilterDomain';
import FilterSite from './Filters/FilterSite';
import FilterTheme from './Filters/FilterTheme';
import FilterVisualization from './Filters/FilterVisualization';

const useStyles = makeStyles((theme) => ({
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

const PresentationFilter = (props) => {
  const classes = useStyles(Theme);

  const [state] = ExploreContext.useExploreContextState();
  const { filtersVisible } = state;

  const belowMd = useMediaQuery(Theme.breakpoints.down('sm'));
  const atSm = useMediaQuery(Theme.breakpoints.only('sm'));
  const visible = filtersVisible || !belowMd;

  // Refs for filter inputs that we can't directly control due to poor performance
  // but on which we want to set values in certain cases
  // Used to set search input value when provided from URL (controlling kills typing performance)
  const searchRef = useRef(null);
  const filterSearch = (
    <FilterSearch {...props} searchRef={searchRef} />
  );

  const filterContent = (
    <div className={classes.filterContent}>
      <FilterResetAll searchRef={searchRef} />
      {atSm ? (
        <div className={classes.twoColumns}>
          <div className={classes.column}>
            {filterSearch}
            <FilterDataStatus {...props} />
            <FilterScienceTeam {...props} />
            <FilterState {...props} />
            <FilterDomain {...props} />
          </div>
          <div className={classes.column}>
            <FilterRelease {...props} />
            <FilterDateRange {...props} />
            <FilterVisualization {...props} />
            <FilterTheme {...props} />
            <FilterSite {...props} />
          </div>
        </div>
      ) : (
        <>
          {filterSearch}
          <FilterRelease {...props} />
          <FilterDateRange {...props} />
          <FilterDataStatus {...props} />
          <FilterVisualization {...props} />
          <FilterScienceTeam {...props} />
          <FilterSite {...props} />
          <FilterState {...props} />
          <FilterDomain {...props} />
          <FilterTheme {...props} />
        </>
      )}
    </div>
  );

  return (
    <div
      id="filter-presentation"
      data-selenium="browse-data-products-page.filters"
      style={{ position: 'relative' }}
    >
      <FilterHeader />
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

export default PresentationFilter;
