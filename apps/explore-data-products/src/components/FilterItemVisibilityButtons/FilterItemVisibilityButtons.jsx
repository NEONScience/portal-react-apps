import React from "react";
import PropTypes from 'prop-types';

import { makeStyles } from '@material-ui/core/styles';
import Button from "@material-ui/core/Button";
import ExpandIcon from '@material-ui/icons/Add';
import CollapseIcon from '@material-ui/icons/Remove';
import ShowSelectedIcon from '@material-ui/icons/CheckBox';

import Theme from 'portal-core-components/lib/components/Theme';

import { FILTER_KEYS, FILTER_ITEM_VISIBILITY_STATES } from '../../util/filterUtil';

const useStyles = makeStyles(theme => ({
  button: {
    padding: theme.spacing(0.25, 1),
    margin: theme.spacing(1, 1, 0, 0),
    whiteSpace: 'nowrap',
    fontSize: '0.75rem',
  },
}));

const FilterItemVisibilityButtons = (props) => {
  const classes = useStyles(Theme);
  const {
    filterKey,
    currentState,
    totalItemCount,
    selectedItemCount,
    onExpandFilterItems,
    onCollapseFilterItems,
    onShowSelectedFilterItems,
  } = props;

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

  const divStyle = {
    marginTop: Theme.spacing(0.5),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
  };

  return (
    <div style={divStyle}>
      {buttons}
    </div>
  );
};

FilterItemVisibilityButtons.propTypes = {
  filterKey: PropTypes.oneOf(Object.keys(FILTER_KEYS)).isRequired,
  currentState: PropTypes.oneOf(Object.keys(FILTER_ITEM_VISIBILITY_STATES)).isRequired,
  totalItemCount: PropTypes.number,
  selectedItemCount: PropTypes.number,
  onExpandFilterItems: PropTypes.func.isRequired,
  onCollapseFilterItems: PropTypes.func.isRequired,
  onShowSelectedFilterItems: PropTypes.func.isRequired,
};

FilterItemVisibilityButtons.defaultProps = {
  totalItemCount: 0,
  selectedItemCount: 0,
};

export default FilterItemVisibilityButtons;
