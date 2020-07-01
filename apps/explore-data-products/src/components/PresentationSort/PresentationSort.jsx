import React from 'react';

import { makeStyles } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';

import Collapse from '@material-ui/core/Collapse';
import FormControl from '@material-ui/core/FormControl';
import Grid from "@material-ui/core/Grid";
import Hidden from "@material-ui/core/Hidden";
import IconButton from "@material-ui/core/IconButton";
import MenuItem from '@material-ui/core/MenuItem';
import Paper from "@material-ui/core/Paper";
import Select from '@material-ui/core/Select';
import Skeleton from '@material-ui/lab/Skeleton';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import Tooltip from "@material-ui/core/Tooltip";
import Typography from "@material-ui/core/Typography";

import SortIcon from '@material-ui/icons/SwapVert';
import AscIcon from '@material-ui/icons/ArrowDownward';
import DescIcon from '@material-ui/icons/ArrowUpward';

import Theme from 'portal-core-components/lib/components/Theme';

import { SORT_METHODS, SORT_DIRECTIONS } from "../../util/filterUtil";

const useStyles = makeStyles(theme => ({
  paper: {
    padding: theme.spacing(3),
    marginBottom: theme.spacing(3),
    justifyContent: 'space-between',
    alignItems: 'top',
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
    color: theme.palette.grey[300],
    marginTop: theme.spacing(1.5),
  },
  summarizeTitle: {
    marginRight: theme.spacing(1.5),
    [theme.breakpoints.down('sm')]: {
      color: theme.palette.text.primary,
      fontStyle: 'normal',
      fontSize: '1.4rem',
    },
  },
  summarize: {
    color: theme.palette.grey[300],
    fontStyle: 'italic',
    fontWeight: 400,
    fontSize: '0.85rem',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  sortContainer: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
}));

const PresentationSort = (props) => {
  const classes = useStyles(Theme);
  const {
    sortMethod,
    sortDirection,
    sortVisible,
    productOrder,
    scrollCutoff,
    filtersApplied,
    filterValues,
    skeleton,
    onApplySort,
    onToggleSortVisibility,
  } = props;

  const visibleBreakpoint = useMediaQuery('(min-width:960px)');
  const visible = sortVisible || visibleBreakpoint;

  const belowSm = useMediaQuery(Theme.breakpoints.only('xs'));

  const collapsedContentDivStyle = {
    display: 'flex',
    marginTop: Theme.spacing(1),
    flexDirection: belowSm ? 'column' : 'row',
  };

  const filtered = filtersApplied.length ? 'filtered' : 'total';
  let showing = (productOrder.length > scrollCutoff)
    ? `Showing first ${scrollCutoff} of ${productOrder.length} ${filtered} products`
    : `Showing all ${productOrder.length} ${filtered} products`;
  if (!productOrder.length) { showing = ''; }

  // Disable sort direction when it doesn't make sense
  // (i.e. does anyone want to sort by _least_ relevant to the search input?)
  const sortDirectionDisabled = (sortMethod === 'searchRelevance');

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
    <React.Fragment>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <FormControl variant="outlined">
          <Select
            value={sortMethod}
            aria-label="Sort Method"
            className={classes.select}
            onChange={(event) => onApplySort(event.target.value)}
            data-selenium="browse-data-products-page.sort.method"
          >
            {Object.keys(SORT_METHODS).map(method => (
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
          onChange={(event, value) => onApplySort(null, value)}
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
    </React.Fragment>
  );

  return (
    <Paper
      className={classes.paper}
      data-selenium="browse-data-products-page.sort"
    >
      <Hidden mdUp>
        <Grid container>
          <Grid item xs={9} sm={9}>
            <div className={classes.summarize}>
              <Typography variant="h4" className={classes.summarizeTitle}>
                Sort
              </Typography>
              {SORT_METHODS[sortMethod].label} {sortDirection === 'ASC' ? '(ascending)' : '(descending)'}
            </div>
          </Grid>
          <Grid item xs={3} sm={3} style={{ textAlign: "right" }}>
            <Tooltip title={`${sortVisible ? 'Collapse' : 'Expand'} sort options`}>
              <IconButton onClick={onToggleSortVisibility}>
                <SortIcon />
              </IconButton>
            </Tooltip>
          </Grid>
        </Grid>
      </Hidden>
      {!visibleBreakpoint ? (
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
            <Typography variant="h4" style={{ marginBottom: Theme.spacing(2) }}>Sort</Typography>
            {sortBlurb}
          </div>
          <div>
            {sortContent}
            {sortShowing}
          </div>
        </div>
      )}
    </Paper>
  );
};

export default PresentationSort;
