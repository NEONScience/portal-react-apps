import React from 'react';
import PropTypes from 'prop-types';

import Button from '@material-ui/core/Button';
import ClearIcon from '@material-ui/icons/Clear';

import ExploreContext from '../ExploreContext';

const FilterResetAll = (props) => {
  const { searchRef } = props;

  const [state, dispatch] = ExploreContext.useExploreContextState();
  const { filtersApplied } = state;

  return (
    <Button
      data-selenium="browse-data-products-page.filters.clear-all-button"
      variant="contained"
      color="primary"
      style={{ width: '100%', marginBottom: '28px' }}
      onClick={() => {
        // Clear the search field value directly (not through state) because
        // the input field is not controlled (controlling it destroys performance).
        if (searchRef.current) { searchRef.current.querySelector('input').value = ''; }
        dispatch({ type: 'resetAllFilters' });
      }}
      disabled={!filtersApplied.length}
      startIcon={<ClearIcon />}
    >
      Reset all filters
    </Button>
  );
};

FilterResetAll.propTypes = {
  searchRef: PropTypes.shape({
    current: PropTypes.instanceOf(Element),
  }).isRequired,
};

export default FilterResetAll;
