import React from 'react';
import PropTypes from 'prop-types';

import Tooltip from '@material-ui/core/Tooltip';
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
    filterItems,
  } = state;

  const filterKey = FILTER_KEYS.THEMES;

  const checkboxProps = {
    filterValues: filterValues[filterKey],
    onApplyFilter: (filterValue) => dispatch({ type: 'applyFilter', filterKey, filterValue }),
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
        {filterItems[filterKey].map((filterItem) => {
          const countTitle = `data products are a part of the ${filterItem.name} theme`;
          return (
            <li key={filterItem.value}>
              <FilterCheckBox
                name={(
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ margin: Theme.spacing(0.5, 1, 0, 0) }}>
                      <DataThemeIcon theme={filterItem.value} size={3} />
                    </div>
                    <Tooltip title={countTitle} arrow>
                      <span>
                        {filterItem.name}
                      </span>
                    </Tooltip>
                  </div>
                )}
                value={filterItem.value}
                count={filterItem.count}
                countTitle={`${filterItem.count} ${countTitle}`}
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

FilterTheme.propTypes = {
  skeleton: PropTypes.bool,
};

FilterTheme.defaultProps = {
  skeleton: false,
};

export default FilterTheme;
