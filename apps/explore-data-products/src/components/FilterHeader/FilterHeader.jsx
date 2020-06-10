import React from "react";

import { makeStyles } from '@material-ui/core/styles';
import Grid from "@material-ui/core/Grid";
import Hidden from "@material-ui/core/Hidden";
import Tooltip from "@material-ui/core/Tooltip";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import FilterIcon from "@material-ui/icons/FilterListRounded";

import Theme from 'portal-core-components/lib/components/Theme';

import { FILTER_LABELS } from "../../util/filterUtil";

const useStyles = makeStyles(theme => ({
  summarizeH5: {
    color: '#000000',
    display: 'inline',
    fontStyle: 'normal',
    marginRight: theme.spacing(1.5),
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
}));

const FilterHeader = (props) => {
  const classes = useStyles(Theme);
  const { filtersVisible, filtersApplied, onToggleFilterVisibility } = props;

  let filterSummary = 'no filters applied';
  if (filtersApplied.length) {
    const filterLabels = filtersApplied.map(key => FILTER_LABELS[key]);
    filterSummary = filterLabels.join(', ');
    if (filtersApplied.length === 2) { filterSummary = filterLabels.join(' and '); }
    if (filtersApplied.length > 2) {
      const lastComma = filterSummary.lastIndexOf(',') + 1;
      filterSummary = `${filterSummary.slice(0, lastComma)} and${filterSummary.slice(lastComma)}`;
    }
    filterSummary = `by ${filterSummary}`;
  }

  return (
    <React.Fragment>
      <Hidden smDown>
        <Typography variant="h5" gutterBottom>Filter</Typography>
      </Hidden>
      <Hidden mdUp>
        <Grid container>
          <Grid item xs={9} sm={9}>
            <div className={classes.summarize}>
              <Typography variant="h5" className={classes.summarizeH5}>
                Filter
              </Typography>
              {filterSummary}
            </div>
          </Grid>
          <Grid item xs={3} sm={3} style={{ textAlign: "right" }}>
            <Tooltip title={`${filtersVisible ? 'Collapse' : 'Expand'} filters`}>
              <IconButton size="small" onClick={onToggleFilterVisibility}>
                <FilterIcon />
              </IconButton>
            </Tooltip>
          </Grid>
        </Grid>
      </Hidden>
    </React.Fragment>
  );
};

export default FilterHeader;
