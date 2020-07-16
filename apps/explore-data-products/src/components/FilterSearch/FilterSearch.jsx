import React, { useState, useRef } from 'react';

import { makeStyles } from '@material-ui/core/styles';
import { fade } from '@material-ui/core/styles/colorManipulator';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import Chip from '@material-ui/core/Chip';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Link from '@material-ui/core/Link';
import TextField from "@material-ui/core/TextField";
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import AddIcon from '@material-ui/icons/Add';

import debounce from 'lodash/debounce';

import Theme from 'portal-core-components/lib/components/Theme';

import { FILTER_KEYS, parseSearchTerms } from '../../util/filterUtil';
import FilterBase from '../FilterBase/FilterBase';

const DEBOUNCE_MILLISECONDS = 200;

const useStyles = makeStyles(theme => ({
  closeButton: {
    color: theme.palette.grey[500],
  },
  dialogTitle: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  dialogContent: {
    display: 'flex',
    marginBottom: Theme.spacing(2),
  },
  keywordColumn: {
    display: 'flex',
    flexDirection: 'column',
    flexBasis: '100%',
    flex: 1,
  },
  keywordLetter: {
    marginBottom: Theme.spacing(2),
  },
  keywords: {
    display: 'flex',
    flexWrap: 'wrap',
    '& p': {
      marginRight: Theme.spacing(3),
      marginBottom: Theme.spacing(2),
    },
  },
  keywordChip: {
    marginBottom: theme.spacing(1),
    marginRight: theme.spacing(1),
    borderColor: fade(theme.palette.primary.main, 0.4),
    borderStyle: 'dotted',
  },
  keywordChipIcon: {
    width: '0.75em',
    height: '0.75em',
    marginLeft: '8px !important',
    marginRight: theme.spacing(-1),
    opacity: 0.4,
  },
  subtitle: {
    fontSize: '0.725rem',
    color: Theme.palette.grey[400],
    marginTop: Theme.spacing(1),
  },
}));

const FilterSearch = (props) => {
  const classes = useStyles(Theme);

  const {
    searchRef,
    productOrder,
    allKeywordsByLetter,
    totalKeywords,
    urlParams,
    localStorageSearch,
    onApplyFilter,
    onResetFilter,
  } = props;

  const filterKey = FILTER_KEYS.SEARCH;

  const [dialogOpen, setDialogOpen] = useState(false);
  const dialogSearchRef = useRef(null);

  const belowSm = useMediaQuery(Theme.breakpoints.only('xs'));
  const belowMd = useMediaQuery(Theme.breakpoints.down('sm'));
  const belowLg = useMediaQuery(Theme.breakpoints.down('md'));

  const debouncedSearch = debounce((searchTerm, applyValueToInput = false) => {
    if (applyValueToInput) {
      searchRef.current.querySelector('input').value = searchTerm;
    }
    if (searchTerm.length) {
      localStorage.setItem('search', searchTerm);
    } else {
      localStorage.removeItem('search');
    }
    const terms = parseSearchTerms(searchTerm);
    if (!terms.length) { return onResetFilter(filterKey); }
    // Push an event with latest term to Google Tag Manager
    window.gtmDataLayer.push({
      event: 'dataProductSearch',
      dataProductSearchTerm: searchTerm,
    });
    return onApplyFilter(filterKey, terms);
  }, DEBOUNCE_MILLISECONDS);

  const lastYear = (new Date()).getFullYear() - 1;
  const placeholder = `Utah, "snow depth", ${lastYear}, etc…`;

  // Set initial value for search input from state. This field is UNCONTROLLED,
  // so we only do this once on first render. Input can come from the URL param
  // (e.g. provided by user input on another page with a search input pointing here)
  // or from the last time the user was on this page and had a search term persist
  // in local storage.
  let defaultValue = '';
  if (typeof localStorageSearch === 'string' && localStorageSearch.length) {
    defaultValue = localStorageSearch;
  }
  if (typeof urlParams.search === 'string' && urlParams.search.length) {
    defaultValue = urlParams.search;
  }

  const renderDialog = () => {
    const onClose = () => setDialogOpen(false);
    const addKeywordToSearch = (keyword) => {
      let search = searchRef.current.querySelector('input').value || '';
      const term = /\s/.test(keyword) ? `"${keyword}"` : keyword;
      if (search.includes(term)) {
        search = search.replace(term, '').trim().replace(/[ ]{2,}/g, ' ');
      } else {
        search = search.length ? `${search} ${term}` : term;
      }
      dialogSearchRef.current.querySelector('input').value = search;
      debouncedSearch(search, true);
    };

    let columns = 4;
    if (belowLg) { columns = 3; }
    if (belowMd) { columns = 2; }
    if (belowSm) { columns = 1; }
    const columnBreak = Math.ceil(totalKeywords / columns);
    const keywordColumns = [];
    let columnIndex = 0;
    let keywordCount = 0;
    Object.keys(allKeywordsByLetter).sort().forEach((letter) => {
      if (!keywordColumns[columnIndex]) { keywordColumns[columnIndex] = {}; }
      keywordColumns[columnIndex][letter] = allKeywordsByLetter[letter];
      keywordCount += allKeywordsByLetter[letter].length;
      if (keywordCount > (columnBreak * (columnIndex + 1))) {
        columnIndex++;
      }
    });

    return (
      <Dialog
        fullWidth
        maxWidth="lg"
        open={dialogOpen}
        onClose={onClose}
        aria-labelledby="keywords-dialog-title"
      >
        <DialogTitle className={classes.dialogTitle} disableTypography>
          <div style={{ flexBasis: '45%', marginRight: Theme.spacing(3) }}>
            <Typography variant="h4" style={{ marginBottom: Theme.spacing(2) }} id="keywords-dialog-title">
              Browse Keywords
            </Typography>
            <Typography variant="body2" className={classes.subtitle}>
              {/* eslint-disable react/jsx-one-expression-per-line */}
              Click keywords below to add them to your search. Separate search
              terms will match products with <i>either</i> term.
              {/* eslint-enable react/jsx-one-expression-per-line */}
            </Typography>
          </div>
          <div style={{ flexBasis: '45%', marginRight: Theme.spacing(3), textAlign: 'right' }}>
            <TextField
              fullWidth
              margin="dense"
              variant="outlined"
              defaultValue={searchRef.current ? searchRef.current.querySelector('input').value : ''}
              placeholder={placeholder}
              style={{ marginBottom: 0 }}
              onChange={(event) => debouncedSearch(event.target.value, true)}
              InputProps={{
                ref: dialogSearchRef,
                'aria-label': 'search',
                type: 'search',
              }}
            />
            <Typography variant="body2" className={classes.subtitle}>
              {`With all filters combined: ${productOrder.length} product${productOrder.length === 1 ? '' : 's'}`}
            </Typography>
          </div>
          <div style={{ flexBasis: Theme.spacing(6), textAlign: 'right' }}>
            <IconButton aria-label="close" className={classes.closeButton} onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </div>
        </DialogTitle>
        <DialogContent className={classes.dialogContent}>
          {keywordColumns.map(column => (
            <div key={Object.keys(column)[0]} className={classes.keywordColumn}>
              {Object.keys(column).sort().map(letter => (
                <div key={letter} className={classes.keywordLetter}>
                  <Typography variant="h6">
                    {letter}
                  </Typography>
                  <div className={classes.keywords}>
                    {allKeywordsByLetter[letter].map(keyword => (
                      <Chip
                        clickable
                        key={keyword}
                        label={keyword}
                        color="primary"
                        variant="outlined"
                        className={classes.keywordChip}
                        onClick={() => addKeywordToSearch(keyword)}
                        icon={<AddIcon className={classes.keywordChipIcon} />}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <FilterBase title="Search" data-selenium="browse-data-products-page.filters.search">
      <TextField
        fullWidth
        name={filterKey}
        margin="dense"
        variant="outlined"
        defaultValue={defaultValue}
        placeholder={placeholder}
        onChange={(event) => debouncedSearch(event.target.value)}
        InputProps={{
          ref: searchRef,
          'aria-label': 'search',
          type: 'search',
        }}
      />
      <Typography variant="body2" className={classes.subtitle}>
        {/* eslint-enable react/jsx-one-expression-per-line */}
        Use several terms to match products having <i>any</i> term (<i>term OR term</i>).&nbsp;
        Quote terms to match phrases (e.g. &quot;wind speed&quot;).&nbsp;
        <Link href="#" onClick={() => setDialogOpen(true)}>Browse keywords</Link> for ideas.
        {/* eslint-enable react/jsx-one-expression-per-line */}
      </Typography>
      {renderDialog()}
    </FilterBase>
  );
};

export default FilterSearch;
