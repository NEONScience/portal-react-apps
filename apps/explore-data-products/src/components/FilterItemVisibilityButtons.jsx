import React from 'react';

import makeStyles from '@mui/styles/makeStyles';
import Button from '@mui/material/Button';
import ExpandIcon from '@mui/icons-material/Add';
import CollapseIcon from '@mui/icons-material/Remove';
import ShowSelectedIcon from '@mui/icons-material/CheckBox';

import Theme from 'portal-core-components/lib/components/Theme';
import { resolveProps } from 'portal-core-components/lib/util/defaultProps';

import { FILTER_ITEM_VISIBILITY_STATES } from '../util/filterUtil';

const useStyles = makeStyles((theme) => ({
  button: {
    margin: theme.spacing(1, 1, 0, 0),
  },
  container: {
    marginTop: Theme.spacing(0.5),
    marginBottom: Theme.spacing(5),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
  },
}));

const defaultProps = {
  totalItemCount: 0,
  selectedItemCount: 0,
};

const FilterItemVisibilityButtons = (inProps) => {
  const classes = useStyles(Theme);
  const {
    filterKey,
    currentState,
    totalItemCount,
    selectedItemCount,
    onExpandFilterItems,
    onCollapseFilterItems,
    onShowSelectedFilterItems,
  } = resolveProps(defaultProps, inProps);

  if (!totalItemCount) { return null; }

  const commonProps = {
    variant: 'outlined',
    color: 'primary',
    size: 'small',
    className: classes.button,
  };

  const expandButton = (
    <Button
      {...commonProps}
      key="expand"
      startIcon={<ExpandIcon />}
      onClick={() => onExpandFilterItems(filterKey)}
    >
      {`View All (${totalItemCount})`}
    </Button>
  );

  const collapseButton = (
    <Button
      {...commonProps}
      key="collapse"
      startIcon={<CollapseIcon />}
      onClick={() => onCollapseFilterItems(filterKey)}
    >
      View Fewer
    </Button>
  );

  const showSelectedButton = (
    <Button
      {...commonProps}
      key="showSelected"
      startIcon={<ShowSelectedIcon />}
      onClick={() => onShowSelectedFilterItems(filterKey)}
    >
      {`View Selected (${selectedItemCount})`}
    </Button>
  );

  const buttons = [];
  switch (currentState) {
    case FILTER_ITEM_VISIBILITY_STATES.EXPANDED:
      buttons.push(selectedItemCount ? showSelectedButton : collapseButton);
      break;
    case FILTER_ITEM_VISIBILITY_STATES.COLLAPSED:
      buttons.push(expandButton);
      if (selectedItemCount) { buttons.push(showSelectedButton); }
      break;
    case FILTER_ITEM_VISIBILITY_STATES.SELECTED:
      buttons.push(expandButton);
      break;
    default:
      break;
  }

  return (
    <div className={classes.container}>
      {buttons}
    </div>
  );
};

export default FilterItemVisibilityButtons;
