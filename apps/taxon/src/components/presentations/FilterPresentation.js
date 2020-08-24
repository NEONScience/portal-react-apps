import React from "react";
import FilterTaxonType from "../filters/FilterTaxonType";

const FilterPresentation = (props) => {
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

export default FilterPresentation;
