import React from 'react';
import PropTypes from 'prop-types';
import FilterTaxonType from '../filters/FilterTaxonType';

function FilterPresentation(props) {
  const {
    taxonTypes,
    taxonQuery,
    onSetTaxonTypes,
    onFilterValueChanged,
  } = props;
  return (
    <div>
      <FilterTaxonType
        taxonTypes={taxonTypes}
        selectedValue={taxonQuery.taxonTypeCode}
        onSetTaxonTypes={onSetTaxonTypes}
        onFilterValueChanged={onFilterValueChanged}
      />
    </div>
  );
}

FilterPresentation.propTypes = {
  taxonTypes: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string,
    value: PropTypes.string,
  })).isRequired,
  taxonQuery: PropTypes.shape({
    taxonTypeCode: PropTypes.string,
    locationName: PropTypes.string,
    rootApiUrl: PropTypes.string,
  }).isRequired,
  onSetTaxonTypes: PropTypes.func.isRequired,
  onFilterValueChanged: PropTypes.func.isRequired,
};

export default FilterPresentation;
