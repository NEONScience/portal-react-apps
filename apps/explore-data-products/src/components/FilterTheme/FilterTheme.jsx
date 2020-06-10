import React from 'react';

import DataThemeIcon from 'portal-core-components/lib/components/DataThemeIcon';
import Theme from 'portal-core-components/lib/components/Theme';

import FilterBase from '../FilterBase/FilterBase';
import FilterCheckBox from '../FilterCheckBox/FilterCheckBox';
import { FILTER_KEYS } from '../../util/filterUtil';

const FilterTheme = (props) => {
  const {
    filterItems,
    filterValues,
    filtersApplied,
    onApplyFilter,
    onResetFilter,
    skeleton,
  } = props;

  const filterKey = FILTER_KEYS.THEMES;

  const checkboxProps = {
    filterKey,
    onApplyFilter,
    onResetFilter,
    filterValues: filterValues[filterKey],
  };

  return (
    <FilterBase
      title="Themes"
      skeleton={skeleton ? 5 : 0}
      data-selenium="browse-data-products-page.filters.themes"
      handleResetFilter={() => onResetFilter(filterKey)}
      showResetButton={filtersApplied.includes(filterKey)}
    >
      <ul>
        {filterItems[filterKey].map(filterItem => (
          <li key={filterItem.value}>
            <FilterCheckBox
              name={(
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ marginRight: Theme.spacing(1) }}>
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
