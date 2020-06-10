import React from 'react';
import PropTypes from 'prop-types';

import { makeStyles } from '@material-ui/core/styles';

import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import InfoIcon from '@material-ui/icons/InfoOutlined';

import Theme from 'portal-core-components/lib/components/Theme';

const useStyles = makeStyles(theme => ({
  tooltip: {
    marginLeft: theme.spacing(0.25),
  },
  popper: {
    '& > div': {
      padding: theme.spacing(1, 1.5),
      fontSize: '0.85rem',
      fontWeight: 300,
      backgroundColor: theme.palette.grey[800],
    },
    '& a': {
      color: theme.palette.grey[100],
    },
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
      PopperProps={{ className: classes.popper }}
      interactive
    >
      <IconButton size="small" className={classes.iconButton} aria-label={tooltip}>
        <InfoIcon fontSize="inherit" />
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
