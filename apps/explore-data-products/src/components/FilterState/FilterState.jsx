import React from 'react';

import FilterBase from '../FilterBase/FilterBase';
import FilterCheckBox from '../FilterCheckBox/FilterCheckBox';
import FilterItemVisibilityButtons from '../FilterItemVisibilityButtons/FilterItemVisibilityButtons';
import { FILTER_KEYS, FILTER_ITEM_VISIBILITY_STATES } from '../../util/filterUtil';

const FilterState = (props) => {
  const {
    filterItems,
    filterValues,
    filtersApplied,
    filterItemVisibility,
    onApplyFilter,
    onResetFilter,
    onExpandFilterItems,
    onCollapseFilterItems,
    onShowSelectedFilterItems,
    skeleton,
  } = props;

  const filterKey = FILTER_KEYS.STATES;
  const FILTER_SHOW_COUNT = 5;

  const checkboxProps = {
    filterKey,
    onApplyFilter,
    onResetFilter,
    filterValues: filterValues[filterKey],
  };

  const subtitle = filtersApplied.includes(filterKey)
    ? `(${filterValues[filterKey].length} selected)`
    : null;

  const byVisibility = (item, idx) => {
    switch (filterItemVisibility[filterKey]) {
      case FILTER_ITEM_VISIBILITY_STATES.COLLAPSED:
        return idx < FILTER_SHOW_COUNT;
      case FILTER_ITEM_VISIBILITY_STATES.SELECTED:
        return filterValues[filterKey].includes(item.value);
      default:
        return true;
    }
  };

  return (
    <FilterBase
      title="States"
      subtitle={subtitle}
      skeleton={skeleton ? FILTER_SHOW_COUNT : 0}
      data-selenium="browse-data-products-page.filters.states"
      handleResetFilter={() => onResetFilter(filterKey)}
      showResetButton={filtersApplied.includes(filterKey)}
    >
      <ul>
        {filterItems[filterKey].filter(byVisibility).map((filterItem) => (
          <li key={filterItem.value}>
            <FilterCheckBox
              name={filterItem.name}
              value={filterItem.value}
              count={filterItem.count}
              countTitle={`{n} data products have data available from sites in ${filterItem.name}`}
              checked={filterValues[filterKey].includes(filterItem.value)}
              {...checkboxProps}
            />
          </li>
        ))}
      </ul>
      <FilterItemVisibilityButtons
        filterKey={filterKey}
        currentState={filterItemVisibility[filterKey]}
        totalItemCount={filterItems[filterKey].length}
        selectedItemCount={filterValues[filterKey].length}
        onExpandFilterItems={onExpandFilterItems}
        onCollapseFilterItems={onCollapseFilterItems}
        onShowSelectedFilterItems={onShowSelectedFilterItems}
      />
    </FilterBase>
  );
};

export default FilterState;
