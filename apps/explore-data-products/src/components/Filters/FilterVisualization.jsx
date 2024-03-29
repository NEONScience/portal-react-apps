import React from 'react';
import PropTypes from 'prop-types';

import ExploreContext from '../../ExploreContext';
import FilterBase from '../FilterBase';
import FilterCheckBox from '../FilterCheckBox';

import { FETCH_STATUS } from '../../util/stateUtil';
import { FILTER_KEYS } from '../../util/filterUtil';

const FilterVisualization = (props) => {
  const { skeleton } = props;

  const [state, dispatch] = ExploreContext.useExploreContextState();
  const {
    filtersApplied,
    filterValues,
    filterItems,
    fetches,
  } = state;

  const filterKey = FILTER_KEYS.VISUALIZATIONS;
  const loadingViz = fetches.aopVizProducts.status === FETCH_STATUS.FETCHING;

  const checkboxProps = {
    filterValues: filterValues[filterKey],
    onApplyFilter: (filterValue) => dispatch({ type: 'applyFilter', filterKey, filterValue }),
    onResetFilter: () => dispatch({ type: 'resetFilter', filterKey }),
  };

  return (
    <FilterBase
      title="Visualizations"
      skeleton={skeleton || loadingViz ? 2 : 0}
      data-selenium="browse-data-products-page.filters.visualizations"
      handleResetFilter={checkboxProps.onResetFilter}
      showResetButton={filtersApplied.includes(filterKey)}
    >
      <ul>
        {filterItems[filterKey].map((filterItem) => (
          <li key={filterItem.value}>
            <FilterCheckBox
              name={filterItem.name}
              value={filterItem.value}
              count={filterItem.count}
              countTitle={`{n} data products can be visualized with the ${filterItem.name}`}
              checked={filterValues[filterKey].includes(filterItem.value)}
              {...checkboxProps}
            />
          </li>
        ))}
      </ul>
    </FilterBase>
  );
};

FilterVisualization.propTypes = {
  skeleton: PropTypes.bool,
};

FilterVisualization.defaultProps = {
  skeleton: false,
};

export default FilterVisualization;
