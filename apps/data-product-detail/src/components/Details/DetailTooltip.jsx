import React from 'react';
import PropTypes from 'prop-types';

import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import InfoIcon from '@mui/icons-material/InfoOutlined';
import { makeStyles } from 'portal-core-components/lib/components/Theme/makeStyles';

const useStyles = makeStyles()((theme) => ({
  tooltip: {
    marginLeft: theme.spacing(0.5),
  },
  iconButton: {
    marginTop: theme.spacing(-0.25),
  },
}));

const DetailTooltip = (props) => {
  const { classes } = useStyles();
  const { tooltip } = props;
  return (
    <Tooltip
      placement="right"
      title={tooltip}
      className={classes.tooltip}
      interactive="true"
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
