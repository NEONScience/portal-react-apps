import React from "react";

import Button from "@material-ui/core/Button";
import ClearIcon from '@material-ui/icons/Clear';

const FilterResetAll = (props) => {
  const { searchRef, filtersApplied, onResetAllFilters } = props;
  return (
    <Button
      data-selenium="browse-data-products-page.filters.clear-all-button"
      variant="contained"
      color="primary"
      style={{ width: "100%", marginBottom: '28px' }}
      onClick={() => {
        // Clear the search field value directly (not through state) because
        // the input field is not controlled (controlling it destroys performance).
        searchRef.current.querySelector('input').value = '';
        onResetAllFilters();
      }}
      disabled={!filtersApplied.length}
      startIcon={<ClearIcon />}
    >
      Reset all filters
    </Button>
  );
};

export default FilterResetAll;
