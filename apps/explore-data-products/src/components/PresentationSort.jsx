import React from 'react';
import PropTypes from 'prop-types';

import { makeStyles } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';

import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Collapse from '@material-ui/core/Collapse';
import FormControl from '@material-ui/core/FormControl';
import Hidden from '@material-ui/core/Hidden';
import IconButton from '@material-ui/core/IconButton';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Skeleton from '@material-ui/lab/Skeleton';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';

import SortIcon from '@material-ui/icons/SwapVert';
import AscIcon from '@material-ui/icons/ArrowDownward';
import DescIcon from '@material-ui/icons/ArrowUpward';
import ClearIcon from '@material-ui/icons/Clear';

import Theme from 'portal-core-components/lib/components/Theme';

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
    [theme.breakpoints.down('sm')]: {
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

const PresentationSort = (props) => {
  const classes = useStyles(Theme);

  const { skeleton } = props;

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

  const belowMd = useMediaQuery(Theme.breakpoints.down('sm'));
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
    <>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <FormControl variant="outlined">
          <Select
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
    </>
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
              <IconButton onClick={() => dispatch({ type: 'toggleSortVisibility' })}>
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

PresentationSort.propTypes = {
  skeleton: PropTypes.bool,
};

PresentationSort.defaultProps = {
  skeleton: false,
};

export default PresentationSort;
