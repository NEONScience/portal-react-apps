import React from 'react';

import MapSelectionButton from 'portal-core-components/lib/components/MapSelectionButton';

import FilterBase from '../FilterBase/FilterBase';
import FilterCheckBox from '../FilterCheckBox/FilterCheckBox';
import FilterItemVisibilityButtons from '../FilterItemVisibilityButtons/FilterItemVisibilityButtons';
import { FILTER_KEYS, FILTER_ITEM_VISIBILITY_STATES } from '../../util/filterUtil';

const FilterDomain = (props) => {
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

  const filterKey = FILTER_KEYS.DOMAINS;
  const FILTER_SHOW_COUNT = 5;

  const checkboxProps = {
    filterKey,
    onApplyFilter,
    onResetFilter,
    filterValues: filterValues[filterKey],
  };

  const subtitle = `(${filtersApplied.includes(filterKey) ? filterValues[filterKey].length : 'none'} selected)`;

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

  const mapSelectionButton = (
    <MapSelectionButton
      selection="DOMAINS"
      selectedItems={filterValues[filterKey]}
      buttonProps={{ variant: 'outlined', color: 'primary', size: 'small' }}
      onSave={(newDomains) => { onApplyFilter(filterKey, Array.from(newDomains)); }}
    />
  );

  return (
    <FilterBase
      title="Domains"
      subtitle={subtitle}
      skeleton={skeleton ? FILTER_SHOW_COUNT : 0}
      data-selenium="browse-data-products-page.filters.domains"
      handleResetFilter={() => onResetFilter(filterKey)}
      showResetButton={filtersApplied.includes(filterKey)}
      additionalTitleButton={mapSelectionButton}
    >
      <ul>
        {filterItems[filterKey].filter(byVisibility).map((filterItem, idx) => (
          <li key={filterItem.value}>
            <FilterCheckBox
              name={filterItem.name}
              value={filterItem.value}
              subtitle={filterItem.subtitle}
              count={filterItem.count}
              countTitle={`{n} data products have data available from sites in domain ${filterItem.name} (${filterItem.subtitle})`}
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

export default FilterDomain;
