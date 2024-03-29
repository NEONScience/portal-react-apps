/* eslint-disable import/no-unresolved */
import React, { Suspense } from 'react';
import PropTypes from 'prop-types';

import ExploreContext from '../../ExploreContext';
import FilterBase from '../FilterBase';
import FilterCheckBox from '../FilterCheckBox';
import FilterItemVisibilityButtons from '../FilterItemVisibilityButtons';

import { FILTER_KEYS, FILTER_ITEM_VISIBILITY_STATES } from '../../util/filterUtil';

const MapSelectionButton = React.lazy(() => import('portal-core-components/lib/components/MapSelectionButton'));

const FilterState = (props) => {
  const { skeleton } = props;

  const [state, dispatch] = ExploreContext.useExploreContextState();
  const {
    filtersApplied,
    filterItemVisibility,
    filterValues,
    filterItems,
  } = state;

  const filterKey = FILTER_KEYS.STATES;
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
    <Suspense fallback={null}>
      <MapSelectionButton
        selection="STATES"
        selectedItems={filterValues[filterKey]}
        buttonProps={{ variant: 'outlined', color: 'primary', size: 'small' }}
        onSave={(newStates) => { onApplyFilter(Array.from(newStates), true); }}
      />
    </Suspense>
  );

  return (
    <FilterBase
      title="States"
      subtitle={subtitle}
      skeleton={skeleton ? FILTER_SHOW_COUNT : 0}
      data-selenium="browse-data-products-page.filters.states"
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
        onExpandFilterItems={() => dispatch({ type: 'expandFilterItems', filterKey })}
        onCollapseFilterItems={() => dispatch({ type: 'collapseFilterItems', filterKey })}
        onShowSelectedFilterItems={() => dispatch({ type: 'showSelectedFilterItems', filterKey })}
      />
    </FilterBase>
  );
};

FilterState.propTypes = {
  skeleton: PropTypes.bool,
};

FilterState.defaultProps = {
  skeleton: false,
};

export default FilterState;
