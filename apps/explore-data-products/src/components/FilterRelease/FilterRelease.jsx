import React from 'react';

import ReleaseFilter from 'portal-core-components/lib/components/ReleaseFilter';

import FilterBase from '../FilterBase/FilterBase';
import { FILTER_KEYS, FILTER_LABELS } from '../../util/filterUtil';

const FilterRelease = (props) => {
  const {
    filterValues,
    filtersApplied,
    onApplyFilter,
    onResetFilter,
    catalogStats,
    releases,
    skeleton,
  } = props;

  const filterKey = FILTER_KEYS.RELEASE;
  const selected = filterValues[filterKey];

  return (
    <FilterBase
      title={FILTER_LABELS[filterKey]}
      data-selenium="browse-data-products-page.filters.release"
      handleResetFilter={() => onResetFilter(filterKey)}
      showResetButton={filtersApplied.includes(filterKey)}
    >
      {/* maxWidth of 276 to match with the wider sidebar */}
      <ReleaseFilter
        title={null}
        releases={releases}
        selected={selected}
        skeleton={!!skeleton}
        onChange={(newReleaseValue) => { onApplyFilter(filterKey, newReleaseValue); }}
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
