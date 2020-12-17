import React from 'react';
import PropTypes from 'prop-types';

import ExploreContext from '../../ExploreContext';
import FilterBase from '../FilterBase';
import FilterCheckBox from '../FilterCheckBox';

import { FILTER_KEYS } from '../../util/filterUtil';

const FilterScienceTeam = (props) => {
  const { skeleton } = props;

  const [state, dispatch] = ExploreContext.useExploreContextState();
  const {
    filtersApplied,
    filterValues,
    filterItems,
  } = state;

  const filterKey = FILTER_KEYS.SCIENCE_TEAM;

  const checkboxProps = {
    filterValues: filterValues[filterKey],
    onApplyFilter: (filterValue) => dispatch({ type: 'applyFilter', filterKey, filterValue }),
    onResetFilter: () => dispatch({ type: 'resetFilter', filterKey }),
  };

  return (
    <FilterBase
      title="Science Team"
      skeleton={skeleton ? 5 : 0}
      data-selenium="browse-data-products-page.filters.science-team"
      handleResetFilter={checkboxProps.onResetFilter}
      showResetButton={filtersApplied.includes(filterKey)}
    >
      <ul>
        {filterItems[filterKey].map((filterItem) => {
          // eslint-disable-next-line max-len
          const countTitle = `{n} data products are provided by the ${filterItem.name} ${filterItem.subtitle} team`;
          return (
            <li key={filterItem.value}>
              <FilterCheckBox
                name={filterItem.name}
                value={filterItem.value}
                count={filterItem.count}
                countTitle={countTitle}
                subtitle={filterItem.subtitle}
                checked={filterValues[filterKey].includes(filterItem.value)}
                {...checkboxProps}
              />
            </li>
          );
        })}
      </ul>
    </FilterBase>
  );
};

FilterScienceTeam.propTypes = {
  skeleton: PropTypes.bool,
};

FilterScienceTeam.defaultProps = {
  skeleton: false,
};

export default FilterScienceTeam;
