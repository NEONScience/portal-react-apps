import React from 'react';

import makeStyles from '@mui/styles/makeStyles';

import Typography from '@mui/material/Typography';

import Theme from 'portal-core-components/lib/components/Theme';
import { resolveProps } from 'portal-core-components/lib/util/defaultProps';

import DetailTooltip from './DetailTooltip';

const useStyles = makeStyles((theme) => ({
  div: {
    marginBottom: theme.spacing(3),
  },
  typography: {
    overflowWrap: 'break-word',
  },
}));

const defaultProps = {
  title: null,
  tooltip: null,
  content: null,
  seleniumKey: null,
  children: null,
};

const Detail = (inProps) => {
  const classes = useStyles(Theme);

  const {
    title,
    tooltip,
    content,
    children,
  } = resolveProps(defaultProps, inProps);

  let { seleniumKey } = inProps;
  if (!seleniumKey) {
    seleniumKey = (title || 'generic').toLowerCase().replace(/[^a-z0-9-]/g, '-');
  }

  const body = content
    ? (
      <Typography variant="body2" component="div" className={classes.typography}>
        {content}
      </Typography>
    ) : children;

  const titleStyle = {
    marginBottom: Theme.spacing(tooltip ? 0.5 : 1),
  };

  return (
    <div
      className={classes.div}
      data-selenium={`data-product-page.detail.${seleniumKey}`}
    >
      <Typography variant="h6" component="div" style={titleStyle}>
        {title}
        {tooltip ? <DetailTooltip tooltip={tooltip} /> : null}
      </Typography>
      {body}
    </div>
  );
};

export default Detail;
