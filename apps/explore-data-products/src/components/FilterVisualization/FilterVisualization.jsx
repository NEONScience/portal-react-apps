import React from "react";

import FilterBase from '../FilterBase/FilterBase';
import FilterCheckBox from '../FilterCheckBox/FilterCheckBox';
import { FILTER_KEYS } from '../../util/filterUtil';

const FilterVisualization = (props) => {
  const {
    filterItems,
    filterValues,
    filtersApplied,
    onApplyFilter,
    onResetFilter,
    onInitiateFilterChange,
    skeleton,
  } = props;

  const filterKey = FILTER_KEYS.VISUALIZATIONS;

  const checkboxProps = {
    filterKey,
    filterValues: filterValues[filterKey],
    onApplyFilter,
    onResetFilter,
    onInitiateFilterChange,
  };

  return (
    <FilterBase
      title="Visualizations"
      skeleton={skeleton ? 2 : 0}
      data-selenium="browse-data-products-page.filters.visualizations"
      handleResetFilter={() => onResetFilter(filterKey)}
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
