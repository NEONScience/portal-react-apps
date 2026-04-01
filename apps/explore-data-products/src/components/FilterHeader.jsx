import React from 'react';

import makeStyles from '@mui/styles/makeStyles';
import Hidden from '@mui/material/Hidden';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ClearIcon from '@mui/icons-material/Clear';
import FilterIcon from '@mui/icons-material/FilterList';

import Theme from 'portal-core-components/lib/components/Theme';

import ExploreContext from '../ExploreContext';

import { FILTER_LABELS } from '../util/filterUtil';

const useStyles = makeStyles((theme) => ({
  title: {
    fontWeight: 600,
    [theme.breakpoints.up('md')]: {
      marginBottom: theme.spacing(2),
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

const FilterHeader = () => {
  const classes = useStyles(Theme);

  const [state, dispatch] = ExploreContext.useExploreContextState();
  const { filtersVisible, filtersApplied } = state;

  let filterSummary = 'no filters applied';
  if (filtersApplied.length) {
    const filterLabels = filtersApplied.map((key) => FILTER_LABELS[key]);
    filterSummary = filterLabels.join(', ');
    if (filtersApplied.length === 2) { filterSummary = filterLabels.join(' and '); }
    if (filtersApplied.length > 2) {
      const lastComma = filterSummary.lastIndexOf(',') + 1;
      filterSummary = `${filterSummary.slice(0, lastComma)} and${filterSummary.slice(lastComma)}`;
    }
    filterSummary = `by ${filterSummary}`;
  }

  const title = (
    <Typography variant="h4" component="h2" className={classes.title}>Filter</Typography>
  );

  return (
    <>
      <Hidden mdDown>
        {title}
      </Hidden>
      <Hidden mdUp>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ flex: 1 }}>
            {title}
            <div className={classes.summary}>
              {filterSummary}
            </div>
          </div>
          <Tooltip
            style={{ flex: 0 }}
            placement="left"
            title={`${filtersVisible ? 'Collapse' : 'Expand'} filters`}
          >
            <IconButton
              onClick={() => { dispatch({ type: 'toggleFilterVisiblity' }); }}
              size="large"
            >
              {filtersVisible ? <ClearIcon /> : <FilterIcon />}
            </IconButton>
          </Tooltip>
        </div>
      </Hidden>
    </>
  );
};

export default FilterHeader;
