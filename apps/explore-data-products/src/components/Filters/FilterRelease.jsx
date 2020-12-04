import React from 'react';

import ReleaseFilter from 'portal-core-components/lib/components/ReleaseFilter';

import ExploreContext from '../../ExploreContext';
import FilterBase from '../FilterBase';

import { FILTER_KEYS, FILTER_LABELS } from '../../util/filterUtil';

const FilterRelease = (props) => {
  const { skeleton } = props;

  const [state, dispatch] = ExploreContext.useExploreContextState();
  const {
    catalogStats,
    filterValues,
    filtersApplied,
    releases,
  } = state;

  const filterKey = FILTER_KEYS.RELEASE;
  const selected = filterValues[filterKey];

  return (
    <FilterBase
      title={FILTER_LABELS[filterKey]}
      data-selenium="browse-data-products-page.filters.release"
      handleResetFilter={() => { dispatch({ type: 'resetFilter', filterKey }); }}
      showResetButton={filtersApplied.includes(filterKey)}
    >
      {/* maxWidth of 276 to match with the wider sidebar */}
      <ReleaseFilter
        title={null}
        releases={releases}
        selected={selected}
        skeleton={!!skeleton}
        onChange={(filterValue) => { dispatch({ type: 'applyFilter', filterKey, filterValue }); }}
        showGenerationDate
        showProductCount
        nullReleaseProductCount={catalogStats.totalProducts}
        maxWidth={276}
        key={selected}
      />
    </FilterBase>
  );
};

export default FilterRelease;
