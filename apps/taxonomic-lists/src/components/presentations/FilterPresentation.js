import React from "react";
import PropTypes from 'prop-types';
import FilterTaxonType from "../filters/FilterTaxonType";

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
  // eslint-disable-next-line react/forbid-prop-types
  taxonTypes: PropTypes.array.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  taxonQuery: PropTypes.object.isRequired,
  onSetTaxonTypes: PropTypes.func.isRequired,
  onFilterValueChanged: PropTypes.func.isRequired,
};

export default FilterPresentation;
