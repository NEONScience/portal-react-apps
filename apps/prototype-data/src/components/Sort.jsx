import React from 'react';

import { makeStyles } from '@material-ui/core/styles';

import FormControl from '@material-ui/core/FormControl';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import Typography from '@material-ui/core/Typography';

import AscIcon from '@material-ui/icons/ArrowDownward';
import DescIcon from '@material-ui/icons/ArrowUpward';

import Theme from 'portal-core-components/lib/components/Theme';

import PrototypeContext from '../PrototypeContext';

import { SORT_METHODS, SORT_DIRECTIONS } from '../filterUtil';

const { usePrototypeContextState } = PrototypeContext;

const useStyles = makeStyles((theme) => ({
  select: {
    height: theme.spacing(6),
    '& div': {
      paddingRight: theme.spacing(4.5),
    },
  },
  title: {
    fontWeight: 500,
    marginBottom: theme.spacing(1),
  },
  toggleButtonGroup: {
    marginLeft: theme.spacing(2),
  },
}));

const Sort = () => {
  const classes = useStyles(Theme);

  const [state, dispatch] = usePrototypeContextState();
  const {
    filterValues,
    sort: { method, direction },
  } = state;

  // Disable sort direction when it doesn't make sense
  // (i.e. does anyone want to sort by _least_ relevant to the search input?)
  const sortDirectionDisabled = (method === 'searchRelevance');

  return (
    <div>
      <Typography variant="h5" component="h3" className={classes.title}>Sort</Typography>
      <div style={{ display: 'flex' }}>
        <FormControl variant="outlined">
          <Select
            value={method}
            aria-label="Sort Method"
            className={classes.select}
            onChange={(event) => dispatch({
              type: 'applySort',
              method: event.target.value,
              direction: null,
            })}
            data-selenium="browse-data-products-page.sort.method"
          >
            {Object.keys(SORT_METHODS).map((methodName) => (
              <MenuItem
                key={methodName}
                value={methodName}
                disabled={SORT_METHODS[methodName].isDisabled(filterValues)}
              >
                {SORT_METHODS[methodName].label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <ToggleButtonGroup
          exclusive
          value={direction}
          className={classes.toggleButtonGroup}
          onChange={(event, value) => dispatch({
            type: 'applySort',
            method: null,
            direction: value,
          })}
          data-selenium="browse-data-products-page.sort.direction"
        >
          <ToggleButton
            value={SORT_DIRECTIONS[0]}
            disabled={sortDirectionDisabled}
            aria-label="Sort Ascending"
          >
            <AscIcon />
          </ToggleButton>
          <ToggleButton
            value={SORT_DIRECTIONS[1]}
            disabled={sortDirectionDisabled}
            aria-label="Sort Descending"
          >
            <DescIcon />
          </ToggleButton>
        </ToggleButtonGroup>
      </div>
    </div>
  );
};

export default Sort;
