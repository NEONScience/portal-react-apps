import React from 'react';

import makeStyles from '@mui/styles/makeStyles';
import useMediaQuery from '@mui/material/useMediaQuery';

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Collapse from '@mui/material/Collapse';
import FormControl from '@mui/material/FormControl';
import Hidden from '@mui/material/Hidden';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Skeleton from '@mui/material/Skeleton';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import SortIcon from '@mui/icons-material/SwapVert';
import AscIcon from '@mui/icons-material/ArrowDownward';
import DescIcon from '@mui/icons-material/ArrowUpward';
import ClearIcon from '@mui/icons-material/Clear';

import Theme from 'portal-core-components/lib/components/Theme';
import { resolveProps } from 'portal-core-components/lib/util/defaultProps';

import ExploreContext from '../ExploreContext';

import { SORT_METHODS, SORT_DIRECTIONS } from '../util/filterUtil';

const useStyles = makeStyles((theme) => ({
  card: {
    marginBottom: theme.spacing(3),
    backgroundColor: theme.palette.grey[50],
    boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.25), 0px 1px 1px rgba(0, 0, 0, 0.25)',
    /*
    [theme.breakpoints.up('md')]: {
      position: 'sticky',
      top: '-4px',
      zIndex: 1,
    },
    */
  },
  select: {
    height: theme.spacing(6),
    '& div': {
      paddingRight: theme.spacing(4.5),
    },
  },
  toggleButtonGroup: {
    marginLeft: theme.spacing(2),
  },
  stat: {
    fontSize: '0.85rem',
    color: theme.palette.grey[500],
    marginTop: theme.spacing(1.5),
  },
  subtitle: {
    fontSize: '0.725rem',
    color: theme.palette.grey[400],
    marginTop: theme.spacing(1.5),
  },
  sortContainer: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  title: {
    fontWeight: 600,
    [theme.breakpoints.up('md')]: {
      marginBottom: theme.spacing(2),
      fontSize: '1.5rem',
    },
    [theme.breakpoints.down('md')]: {
      marginRight: theme.spacing(1.5),
      fontSize: '1.3rem',
    },
  },
  summary: {
    color: theme.palette.grey[400],
    fontWeight: 400,
    fontSize: '0.85rem',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    marginTop: theme.spacing(1),
  },
}));

const defaultProps = {
  skeleton: false,
};

const PresentationSort = (inProps) => {
  const classes = useStyles(Theme);

  const { skeleton } = resolveProps(defaultProps, inProps);

  const [state, dispatch] = ExploreContext.useExploreContextState();
  const {
    sortMethod,
    sortDirection,
    sortVisible,
    scrollCutoff,
    filtersApplied,
    filterValues,
    currentProducts: { order: productOrder },
  } = state;

  const belowMd = useMediaQuery(Theme.breakpoints.down('md'));
  const belowSm = useMediaQuery(Theme.breakpoints.only('xs'));
  const visible = sortVisible || !belowMd;

  const collapsedContentDivStyle = {
    display: 'flex',
    flexDirection: belowSm ? 'column' : 'row',
    marginTop: Theme.spacing(2),
  };

  const filtered = filtersApplied.length ? 'filtered' : 'total';
  let showing = (productOrder.length > scrollCutoff)
    ? `Showing first ${scrollCutoff} of ${productOrder.length} ${filtered} products`
    : `Showing all ${productOrder.length} ${filtered} products`;
  if (!productOrder.length) { showing = ''; }

  // Disable sort direction when it doesn't make sense
  // (i.e. does anyone want to sort by _least_ relevant to the search input?)
  const sortDirectionDisabled = (sortMethod === 'searchRelevance');

  const title = (
    <Typography variant="h4" component="h2" className={classes.title}>Sort</Typography>
  );

  const summary = `${SORT_METHODS[sortMethod].label} ${sortDirection === 'ASC' ? '(ascending)' : '(descending)'}`;

  const sortBlurb = (
    <Typography
      variant="body2"
      className={classes.subtitle}
      style={{ margin: Theme.spacing(0, (belowSm ? 0 : 2), (belowSm ? 2 : 0), 0) }}
    >
      &quot;Available&quot; data products will always show above
      &quot;Coming Soon&quot; data products, except when sorting
      by search relevance.
    </Typography>
  );

  const sortShowing = (
    <div style={{ width: '100%', textAlign: 'right' }}>
      {skeleton ? (
        <Skeleton width="100%" height={12} style={{ marginTop: Theme.spacing(2) }} />
      ) : (
        <Typography
          variant="subtitle2"
          className={classes.stat}
          data-selenium="browse-data-products-page.sort.products-showing"
        >
          {showing}
        </Typography>
      )}
    </div>
  );

  const sortContent = (
    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
      <FormControl variant="outlined">
        <Select
          variant="standard"
          value={sortMethod}
          aria-label="Sort Method"
          className={classes.select}
          onChange={(event) => dispatch({
            type: 'applySort',
            sortMethod: event.target.value,
            sortDirection: null,
          })}
          data-selenium="browse-data-products-page.sort.method"
        >
          {Object.keys(SORT_METHODS).map((method) => (
            <MenuItem
              key={method}
              value={method}
              disabled={SORT_METHODS[method].isDisabled(filterValues)}
            >
              {SORT_METHODS[method].label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <ToggleButtonGroup
        exclusive
        value={sortDirection}
        className={classes.toggleButtonGroup}
        onChange={(event, value) => dispatch({
          type: 'applySort',
          sortMethod: null,
          sortDirection: value,
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
  );

  return (
    <Card className={classes.card}>
      <CardContent data-selenium="browse-data-products-page.sort">
        <Hidden mdUp>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ flex: 1 }}>
              {title}
              <div className={classes.summary}>
                {summary}
              </div>
            </div>
            <Tooltip
              placement="left"
              title={`${sortVisible ? 'Collapse' : 'Expand'} sort options`}
            >
              <IconButton onClick={() => dispatch({ type: 'toggleSortVisibility' })} size="large">
                {sortVisible ? <ClearIcon /> : <SortIcon />}
              </IconButton>
            </Tooltip>
          </div>
        </Hidden>
        {belowMd ? (
          <Collapse in={visible}>
            <div style={collapsedContentDivStyle}>
              {sortBlurb}
              {sortContent}
            </div>
            {sortShowing}
          </Collapse>
        ) : (
          <div className={classes.sortContainer}>
            <div>
              {title}
              {sortBlurb}
            </div>
            <div>
              {sortContent}
              {sortShowing}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PresentationSort;
