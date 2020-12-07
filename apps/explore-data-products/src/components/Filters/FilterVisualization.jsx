import React from "react";

import ExploreContext from '../../ExploreContext';
import FilterBase from '../FilterBase';
import FilterCheckBox from '../FilterCheckBox';

import { FILTER_KEYS } from '../../util/filterUtil';

const FilterVisualization = (props) => {
  const { skeleton } = props;
  
  const [state, dispatch] = ExploreContext.useExploreContextState();
  const {
    filtersApplied,
    filterValues,
    filterItems,
  } = state;  

  const filterKey = FILTER_KEYS.VISUALIZATIONS;

  const checkboxProps = {
    filterKey,
    onApplyFilter: (filterValue) => dispatch({ type: 'resetFilter', filterKey, filterValue }),
    onResetFilter: () => dispatch({ type: 'resetFilter', filterKey }),
  };

  return (
    <FilterBase
      title="Visualizations"
      skeleton={skeleton ? 2 : 0}
      data-selenium="browse-data-products-page.filters.visualizations"
      handleResetFilter={checkboxProps.onResetFilter}
      showResetButton={filtersApplied.includes(filterKey)}
    >
      <ul>
        {filterItems[filterKey].map(filterItem => (
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

export default FilterVisualization;
