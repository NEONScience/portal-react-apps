import React from 'react';
import PropTypes from 'prop-types';

import { makeStyles } from '@material-ui/core/styles';

import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import InfoIcon from '@material-ui/icons/InfoOutlined';

import Theme from 'portal-core-components/lib/components/Theme';

const useStyles = makeStyles(theme => ({
  tooltip: {
    marginLeft: theme.spacing(0.5),
  },
  iconButton: {
    marginTop: theme.spacing(-0.25),
  },
}));

const DetailTooltip = (props) => {
  const classes = useStyles(Theme);
  const { tooltip } = props;
  return (
    <Tooltip
      placement="right"
      title={tooltip}
      className={classes.tooltip}
      interactive
    >
      <IconButton size="small" className={classes.iconButton} aria-label={tooltip}>
        <InfoIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  );
};

DetailTooltip.propTypes = {
  tooltip: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.node,
  ]).isRequired,
};

export default DetailTooltip;
