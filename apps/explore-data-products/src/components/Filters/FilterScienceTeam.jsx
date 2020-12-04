import React from 'react';

import FilterBase from '../FilterBase/FilterBase';
import FilterCheckBox from '../FilterCheckBox/FilterCheckBox';
import { FILTER_KEYS } from '../../util/filterUtil';

const FilterScienceTeam = (props) => {
  const {
    filterItems,
    filterValues,
    filtersApplied,
    onApplyFilter,
    onResetFilter,
    skeleton,
  } = props;

  const filterKey = FILTER_KEYS.SCIENCE_TEAM;

  const checkboxProps = {
    filterKey,
    onApplyFilter,
    onResetFilter,
    filterValues: filterValues[filterKey],
  };

  return (
    <FilterBase
      title="Science Team"
      skeleton={skeleton ? 5 : 0}
      data-selenium="browse-data-products-page.filters.science-team"
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
              countTitle={`{n} data products are provided by the ${filterItem.name} ${filterItem.subtitle} team`}
              subtitle={filterItem.subtitle}
              checked={filterValues[filterKey].includes(filterItem.value)}
              {...checkboxProps}
            />
          </li>
        ))}
      </ul>
    </FilterBase>
  );
};

export default FilterScienceTeam;
