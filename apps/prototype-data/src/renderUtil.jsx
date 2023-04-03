/* eslint-disable import/prefer-default-export */
import React from 'react';
import PropTypes from 'prop-types';

import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';

import Skeleton from '@material-ui/lab/Skeleton';

import Theme from 'portal-core-components/lib/components/Theme';

const useStyles = makeStyles((theme) => ({
  sidebarContentFont: {
    color: 'rgba(0, 0, 0, 0.70)',
  },
  NA: {
    fontStyle: 'italic',
    color: theme.palette.grey[400],
  },
}));

// eslint-disable-next-line max-len
export const getSkeleton = (height = 10, width = 100, marginBottom = 0, widthIsPercent = true, variant = 'text') => {
  let widthValue = width || 100;
  if (Array.isArray(width) && width.length === 2) {
    widthValue = Math.round(width[0] + (Math.random() * (width[1] - width[0])));
  }
  const widthProp = widthIsPercent ? `${widthValue}%` : widthValue;
  const props = { height, width: widthProp, variant: 'rect' };
  if (marginBottom) { props.style = { marginBottom }; }
  return (
    <Skeleton
      variant={variant}
      height={height}
      width={widthProp}
      style={!marginBottom ? null : { marginBottom: Theme.spacing(marginBottom) }}
    />
  );
};

export const getDoiDisplay = (doi) => {
  const hasDoi = doi && doi.url;
  if (!hasDoi) {
    return undefined;
  }
  return doi.url.split('/').slice(-2).join('/');
};

export const DoiDetail = (props) => {
  const classes = useStyles(Theme);
  const { doi } = props;
  // eslint-disable-next-line react/destructuring-assignment
  const hasDoi = doi && doi.url;
  if (!hasDoi) {
    return (
      <Typography variant="body1" className={classes.NA}>
        Not Available
      </Typography>
    );
  }
  // eslint-disable-next-line react/destructuring-assignment
  const doiId = getDoiDisplay(doi);
  return (
    <List dense style={{ margin: 0, padding: 0 }}>
      <ListItem key="DOI" style={{ padding: 0, margin: 0 }}>
        <ListItemText
          style={{ margin: 0 }}
          primary={(
            <Typography variant="body1" className={classes.sidebarContentFont}>
              {doiId}
            </Typography>
          )}
        />
      </ListItem>
    </List>
  );
};

DoiDetail.propTypes = {
  doi: PropTypes.shape({
    url: PropTypes.string,
  }).isRequired,
};
