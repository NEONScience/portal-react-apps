/* eslint-disable import/no-unresolved */
import React, { Suspense } from 'react';
import PropTypes from 'prop-types';

import ExploreContext from '../../ExploreContext';
import FilterBase from '../FilterBase';
import FilterCheckBox from '../FilterCheckBox';
import FilterItemVisibilityButtons from '../FilterItemVisibilityButtons';

import { FILTER_KEYS, FILTER_ITEM_VISIBILITY_STATES } from '../../util/filterUtil';

const MapSelectionButton = React.lazy(() => import('portal-core-components/lib/components/MapSelectionButton'));

const FilterSite = (props) => {
  const { skeleton } = props;

  const [state, dispatch] = ExploreContext.useExploreContextState();
  const {
    filtersApplied,
    filterItemVisibility,
    filterValues,
    filterItems,
  } = state;

  const filterKey = FILTER_KEYS.SITES;
  const FILTER_SHOW_COUNT = 5;

  const onApplyFilter = (filterValue, showOnlySelected = false) => {
    dispatch({
      type: 'applyFilter',
      filterKey,
      filterValue,
      showOnlySelected,
    });
  };
  const onResetFilter = () => dispatch({ type: 'resetFilter', filterKey });
  const checkboxProps = {
    filterValues: filterValues[filterKey],
    onApplyFilter,
    onResetFilter,
  };

  const selected = filtersApplied.includes(filterKey) ? filterValues[filterKey].length : 'none';
  const subtitle = `(${selected} selected)`;

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
    <Suspense fallback={null}>
      <MapSelectionButton
        selection="SITES"
        selectedItems={filterValues[filterKey]}
        buttonProps={{ variant: 'outlined', color: 'primary', size: 'small' }}
        onSave={(newSites) => { onApplyFilter(Array.from(newSites), true); }}
      />
    </Suspense>
  );

  return (
    <FilterBase
      title="Sites"
      subtitle={subtitle}
      skeleton={skeleton ? FILTER_SHOW_COUNT : 0}
      data-selenium="browse-data-products-page.filters.sites"
      handleResetFilter={onResetFilter}
      showResetButton={filtersApplied.includes(filterKey)}
      additionalTitleButton={mapSelectionButton}
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
        onExpandFilterItems={() => dispatch({ type: 'expandFilterItems', filterKey })}
        onCollapseFilterItems={() => dispatch({ type: 'collapseFilterItems', filterKey })}
        onShowSelectedFilterItems={() => dispatch({ type: 'showSelectedFilterItems', filterKey })}
      />
    </FilterBase>
  );
};

FilterSite.propTypes = {
  skeleton: PropTypes.bool,
};

FilterSite.defaultProps = {
  skeleton: false,
};

export default FilterSite;
