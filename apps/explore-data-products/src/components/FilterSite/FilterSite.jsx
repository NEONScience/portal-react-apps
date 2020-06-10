import React from 'react';

import FilterBase from '../FilterBase/FilterBase';
import FilterCheckBox from '../FilterCheckBox/FilterCheckBox';
import FilterItemVisibilityButtons from '../FilterItemVisibilityButtons/FilterItemVisibilityButtons';
import { FILTER_KEYS, FILTER_ITEM_VISIBILITY_STATES } from '../../util/filterUtil';

const FilterSite = (props) => {
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

  const filterKey = FILTER_KEYS.SITES;
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
      title="Sites"
      subtitle={subtitle}
      skeleton={skeleton ? FILTER_SHOW_COUNT : 0}
      data-selenium="browse-data-products-page.filters.sites"
      handleResetFilter={() => onResetFilter(filterKey)}
      showResetButton={filtersApplied.includes(filterKey)}
    >
      <ul>
        {filterItems[filterKey].filter(byVisibility).map((filterItem) => (
          <li key={filterItem.value}>
            <FilterCheckBox
              name={filterItem.name}
              value={filterItem.value}
              subtitle={filterItem.subtitle}
              count={filterItem.count}
              countTitle={`{n} data products have data available from site ${filterItem.name} (${filterItem.subtitle})`}
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

export default FilterSite;
