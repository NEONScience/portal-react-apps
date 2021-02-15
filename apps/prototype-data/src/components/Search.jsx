import React from 'react';
import PropTypes from 'prop-types';

import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';

import debounce from 'lodash/debounce';

import Theme from 'portal-core-components/lib/components/Theme';

import PrototypeContext from '../PrototypeContext';
import FilterBase from './FilterBase';

import { FILTER_KEYS, parseSearchTerms } from '../filterUtil';

const { usePrototypeContextState } = PrototypeContext;

const DEBOUNCE_MILLISECONDS = 200;

const useStyles = makeStyles((theme) => ({
  subtitle: {
    fontSize: '0.725rem',
    color: theme.palette.grey[400],
    marginTop: theme.spacing(1),
  },
  searchInput: {
    '& input': {
      backgroundColor: '#fff',
    },
  },
  textField: {
    marginTop: '0px',
  },
}));

const Search = (props) => {
  const classes = useStyles(Theme);
  const { searchRef } = props;

  const [, dispatch] = usePrototypeContextState();

  const filterKey = FILTER_KEYS.SEARCH;

  const debouncedSearch = debounce((searchTerm, applyValueToInput = false) => {
    if (applyValueToInput) {
      searchRef.current.querySelector('input').value = searchTerm;
    }
    const terms = parseSearchTerms(searchTerm);
    if (!terms.length) { dispatch({ type: 'resetFilter', filterKey }); }
    // Push an event with latest term to Google Tag Manager
    window.gtmDataLayer.push({
      event: 'prototypeDatasetSearch',
      datasetSearchTerm: searchTerm,
    });
    return dispatch({ type: 'applyFilter', filterKey, filterValue: terms });
  }, DEBOUNCE_MILLISECONDS);

  const lastYear = (new Date()).getFullYear() - 1;
  const placeholder = `Utah, "snow depth", ${lastYear}, etc…`;

  return (
    <FilterBase title="Search" data-selenium="prototype-datasets-page.filters.search">
      <TextField
        fullWidth
        name={filterKey}
        margin="dense"
        variant="outlined"
        defaultValue=""
        placeholder={placeholder}
        onChange={(event) => debouncedSearch(event.target.value)}
        className={classes.textField}
        InputProps={{
          ref: searchRef,
          'aria-label': 'search',
          type: 'search',
          className: classes.searchInput,
        }}
      />
      <Typography variant="body2" className={classes.subtitle}>
        {/* eslint-disable react/jsx-one-expression-per-line */}
        Use several terms to match datasets having <i>any</i> term (<i>term OR term</i>).&nbsp;
        Quote terms to match phrases (e.g. &quot;wind speed&quot;)
        {/* eslint-enable react/jsx-one-expression-per-line */}
      </Typography>
    </FilterBase>
  );
};

Search.propTypes = {
  searchRef: PropTypes.shape({
    current: PropTypes.instanceOf(Element),
  }).isRequired,
};

export default Search;
