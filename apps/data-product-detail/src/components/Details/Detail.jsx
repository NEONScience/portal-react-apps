import React from 'react';
import PropTypes from 'prop-types';

import { makeStyles } from '@material-ui/core/styles';

import Typography from '@material-ui/core/Typography';

import Theme from 'portal-core-components/lib/components/Theme';

import DetailTooltip from './DetailTooltip';

const useStyles = makeStyles(theme => ({
  div: {
    marginBottom: theme.spacing(2),
  },
  typography: {
    overflowWrap: 'break-word',
  },
}));

const Detail = (props) => {
  const classes = useStyles(Theme);

  const {
    title,
    tooltip,
    content,
    children,
  } = props;

  let { seleniumKey } = props;
  if (!seleniumKey) {
    seleniumKey = (title || 'generic').toLowerCase().replace(/[^a-z0-9-]/g, '-');
  }

  const body = content
    ? (
      <Typography variant="body2" component="div" className={classes.typography}>
        {content}
      </Typography>
    ) : children;

  return (
    <div
      className={classes.div}
      data-selenium={`data-product-page.detail.${seleniumKey}`}
    >
      <Typography variant="h6" component="div" gutterBottom>
        {title}
        {tooltip ? <DetailTooltip tooltip={tooltip} /> : null}
      </Typography>
      {body}
    </div>
  );
};

Detail.propTypes = {
  title: PropTypes.string,
  tooltip: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.node,
  ]),
  content: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.node,
  ]),
  seleniumKey: PropTypes.string,
  children: PropTypes.node,
};

Detail.defaultProps = {
  title: null,
  tooltip: null,
  content: null,
  seleniumKey: null,
  children: null,
};

export default Detail;
