import React, { useRef } from 'react';

import { makeStyles } from '@material-ui/core/styles';
import Collapse from '@material-ui/core/Collapse';
import Divider from '@material-ui/core/Divider';
import Paper from "@material-ui/core/Paper";
import useMediaQuery from '@material-ui/core/useMediaQuery';

import Theme from 'portal-core-components/lib/components/Theme';

import FilterHeader from '../FilterHeader/FilterHeader';
import FilterResetAll from '../FilterResetAll/FilterResetAll';
import FilterSearch from '../FilterSearch/FilterSearch';
import FilterDateRange from '../FilterDateRange/FilterDateRange';
import FilterDataStatus from '../FilterDataStatus/FilterDataStatus';
import FilterScienceTeam from '../FilterScienceTeam/FilterScienceTeam';
import FilterState from '../FilterState/FilterState';
import FilterDomain from '../FilterDomain/FilterDomain';
import FilterSite from '../FilterSite/FilterSite';
import FilterTheme from '../FilterTheme/FilterTheme';
import FilterVisualization from '../FilterVisualization/FilterVisualization';

const useStyles = makeStyles(theme => ({
  divider: {
    margin: theme.spacing(2, 0),
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
    skeleton,
  } = props;
  
  const visibleBreakpoint = useMediaQuery('(min-width:960px)');
  const visible = filtersVisible || visibleBreakpoint;

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
  
  const filterContent = (
    <React.Fragment>
      <Divider className={classes.divider} />
      <FilterResetAll
        searchRef={searchRef}
        filtersApplied={filtersApplied}
        onResetAllFilters={onResetAllFilters}
      />
      <Divider className={classes.divider} />
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
      <Divider className={classes.divider} />
      <FilterDateRange {...filterProps} />
      <Divider className={classes.divider} />
      <FilterDataStatus {...filterProps} />
      <Divider className={classes.divider} />
      <FilterVisualization {...filterProps} />
      <Divider className={classes.divider} />
      <FilterScienceTeam {...filterProps} />
      <Divider className={classes.divider} />
      <FilterState {...filterProps} />
      <Divider className={classes.divider} />
      <FilterSite {...filterProps} />
      <Divider className={classes.divider} />
      <FilterDomain {...filterProps} />
      <Divider className={classes.divider} />
      <FilterTheme {...filterProps} />
    </React.Fragment>
  );

  return (
    <Paper
      id="filter-presentation"
      data-selenium="browse-data-products-page.filters"
      style={{ padding: Theme.spacing(2) }}
    >
      <FilterHeader
        filtersVisible={filtersVisible}
        filtersApplied={filtersApplied}
        onToggleFilterVisibility={onToggleFilterVisibility}
      />
      {!visibleBreakpoint ? (
        <Collapse in={visible}>
          {filterContent}
        </Collapse>
      ) : filterContent}
    </Paper>
  );
};

export default PresentationFilter;
