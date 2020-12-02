import React, { useRef } from 'react';

import { makeStyles } from '@material-ui/core/styles';
import Collapse from '@material-ui/core/Collapse';
import useMediaQuery from '@material-ui/core/useMediaQuery';

import Theme from 'portal-core-components/lib/components/Theme';

import FilterHeader from '../FilterHeader/FilterHeader';
import FilterResetAll from '../FilterResetAll/FilterResetAll';
import FilterSearch from '../FilterSearch/FilterSearch';
import FilterRelease from '../FilterRelease/FilterRelease';
import FilterDateRange from '../FilterDateRange/FilterDateRange';
import FilterDataStatus from '../FilterDataStatus/FilterDataStatus';
import FilterScienceTeam from '../FilterScienceTeam/FilterScienceTeam';
import FilterState from '../FilterState/FilterState';
import FilterDomain from '../FilterDomain/FilterDomain';
import FilterSite from '../FilterSite/FilterSite';
import FilterTheme from '../FilterTheme/FilterTheme';
import FilterVisualization from '../FilterVisualization/FilterVisualization';

const useStyles = makeStyles(theme => ({
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

  const {
    filterItems,
    filterValues,
    filtersApplied,
    filtersVisible,
    filterItemVisibility,
    catalogStats,
    productOrder,
    allKeywordsByLetter,
    totalKeywords,
    onApplyFilter,
    onResetFilter,
    onResetAllFilters,
    onExpandFilterItems,
    onCollapseFilterItems,
    onShowSelectedFilterItems,
    onToggleFilterVisibility,
    urlParams,
    localStorageSearch,
    releases,
    skeleton,
  } = props;
  
  const belowMd = useMediaQuery(Theme.breakpoints.down('sm'));
  const atSm = useMediaQuery(Theme.breakpoints.only('sm'));
  const visible = filtersVisible || !belowMd;

  // TODO: Use a context here to get around all this prop-drilling
  const filterProps = {
    filterItems,
    filterValues,
    filterItemVisibility,
    filtersApplied,
    onApplyFilter,
    onResetFilter,
    onExpandFilterItems,
    onCollapseFilterItems,
    onShowSelectedFilterItems,
    skeleton,
  };

  // Refs for filter inputs that we can't directly control due to poor performance
  // but on which we want to set values in certain cases
  // Used to set search input value when provided from URL (controlling kills typing performance)
  const searchRef = useRef(null);

  const filterSearch = (
    <FilterSearch
      searchRef={searchRef}
      urlParams={urlParams}
      localStorageSearch={localStorageSearch}
      filtersApplied={filtersApplied}
      productOrder={productOrder}
      allKeywordsByLetter={allKeywordsByLetter}
      totalKeywords={totalKeywords}
      {...filterProps}
    />
  );

  const filterRelease = (
    <FilterRelease
      releases={releases}
      catalogStats={catalogStats}
      {...filterProps}
    />
  );
  
  const filterContent = (
    <div className={classes.filterContent}>
      <FilterResetAll
        searchRef={searchRef}
        filtersApplied={filtersApplied}
        onResetAllFilters={onResetAllFilters}
      />
      {atSm ? (
        <div className={classes.twoColumns}>
          <div className={classes.column}>
            {filterSearch}
            <FilterDataStatus {...filterProps} />
            <FilterScienceTeam {...filterProps} />
            <FilterState {...filterProps} />
            <FilterDomain {...filterProps} />
          </div>
          <div className={classes.column}>
            {filterRelease}
            <FilterDateRange {...filterProps} />
            <FilterVisualization {...filterProps} />
            <FilterTheme {...filterProps} />
            <FilterSite {...filterProps} />
          </div>
        </div>
      ) : (
        <React.Fragment>
          {filterSearch}
          {filterRelease}
          <FilterDateRange {...filterProps} />
          <FilterDataStatus {...filterProps} />
          <FilterVisualization {...filterProps} />
          <FilterScienceTeam {...filterProps} />
          <FilterSite {...filterProps} />
          <FilterState {...filterProps} />
          <FilterDomain {...filterProps} />
          <FilterTheme {...filterProps} />
        </React.Fragment>
      )}
    </div>
  );

  return (
    <div
      id="filter-presentation"
      data-selenium="browse-data-products-page.filters"
      style={{ position: 'relative' }}
    >
      <FilterHeader
        filtersVisible={filtersVisible}
        filtersApplied={filtersApplied}
        onToggleFilterVisibility={onToggleFilterVisibility}
      />
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
