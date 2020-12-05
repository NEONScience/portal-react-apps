import React from 'react';

import DataThemeIcon from 'portal-core-components/lib/components/DataThemeIcon';
import Theme from 'portal-core-components/lib/components/Theme';

import ExploreContext from '../../ExploreContext';
import FilterBase from '../FilterBase';
import FilterCheckBox from '../FilterCheckBox';

import { FILTER_KEYS } from '../../util/filterUtil';

const FilterTheme = (props) => {
  const { skeleton } = props;
  
  const [state, dispatch] = ExploreContext.useExploreContextState();
  const {
    filtersApplied,
    filterValues,
    currentProducts: { filterItems },
  } = state;

  const filterKey = FILTER_KEYS.THEMES;

  const checkboxProps = {
    filterValues: filterValues[filterKey],
    onApplyFilter: (filterValue) => dispatch({ type: 'resetFilter', filterKey, filterValue }),
    onResetFilter: () => dispatch({ type: 'resetFilter', filterKey }),
  };

  return (
    <FilterBase
      title="Themes"
      skeleton={skeleton ? 5 : 0}
      data-selenium="browse-data-products-page.filters.themes"
      handleResetFilter={checkboxProps.onResetFilter}
      showResetButton={filtersApplied.includes(filterKey)}
    >
      <ul>
        {filterItems[filterKey].map(filterItem => (
          <li key={filterItem.value}>
            <FilterCheckBox
              name={(
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ margin: Theme.spacing(0.5, 1, 0, 0) }}>
                    <DataThemeIcon theme={filterItem.value} size={3} />
                  </div>
                  <span>
                    {filterItem.name}
                  </span>
                </div>
              )}
              value={filterItem.value}
              count={filterItem.count}
              countTitle={`{n} data products are a part of the ${filterItem.name} theme`}
              checked={filterValues[filterKey].includes(filterItem.value)}
              {...checkboxProps}
            />
          </li>
        ))}
      </ul>
    </FilterBase>
  );
};

export default FilterTheme;
