import React from 'react';
import PropTypes from 'prop-types';

import DataThemeIcon from '@neonscience/portal-core-components/components/DataThemeIcon';
import { resolveProps } from '@neonscience/portal-core-components/util/defaultProps';
import { useTheme } from '@mui/material/styles';

import PrototypeContext from '../PrototypeContext';
import FilterBase from './FilterBase';
import FilterCheckBox from './FilterCheckBox';

import { FILTER_KEYS } from '../filterUtil';

const { usePrototypeContextState } = PrototypeContext;

const defaultProps = {
  skeleton: false,
};

const FilterTheme = (inProps) => {
  const props = resolveProps(defaultProps, inProps);
  const { skeleton } = props;
  const theme = useTheme();

  const [state, dispatch] = usePrototypeContextState();
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
        {filterItems[filterKey].map((filterItem) => (
          <li key={filterItem.value}>
            <FilterCheckBox
              name={(
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ margin: theme.spacing(0.5, 1, 0, 0) }}>
                    <DataThemeIcon theme={filterItem.value} size={3} />
                  </div>
                  <span>
                    {filterItem.name}
                  </span>
                </div>
              )}
              value={filterItem.value}
              count={filterItem.count}
              countTitle={`{n} datasets are a part of the ${filterItem.name} theme`}
              checked={filterValues[filterKey].includes(filterItem.value)}
              {...checkboxProps}
            />
          </li>
        ))}
      </ul>
    </FilterBase>
  );
};

FilterTheme.propTypes = {
  skeleton: PropTypes.bool,
};

export default FilterTheme;
