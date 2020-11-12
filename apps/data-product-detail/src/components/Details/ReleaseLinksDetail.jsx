import React, { useContext } from 'react';

import { makeStyles } from '@material-ui/core/styles';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';

import Theme from 'portal-core-components/lib/components/Theme';

import Detail from './Detail';

import { StoreContext } from '../../Store';

const useStyles = makeStyles(theme => ({
  releaseListItem: {
    color: theme.palette.primary.main,
  },
  currentReleaseListItem: {
    color: theme.palette.grey[400],
    '& > div > span': {
      fontWeight: 600,
    },
  },
}));

const KeywordsDetail = () => {
  const { state } = useContext(StoreContext);
  const classes = useStyles(Theme);

  const { product, releases, currentRelease } = state;

  const getReleaseURL = releaseName => `/data-products/${product.productCode}/${releaseName}`;

  return (
    <Detail
      title="Releases"
    >
      {!(releases || []).length ? (
        <i>n/a - all data are provisional</i>
      ) : (
        <List>
          {releases.map(release => (
            release.name === currentRelease ? (
              <ListItem
                key={release.name}
                className={classes.currentReleaseListItem}
              >
                <ListItemText primary={release.name} secondary="Currently viewing" />
              </ListItem>
            ) : (
              <ListItem
                key={release.name}
                component="a"
                href={getReleaseURL(release.name)}
                className={classes.releaseListItem}
                button
              >
                <ListItemText primary={release.name} />
              </ListItem>
            )
          ))}
        </List>
      )}
    </Detail>
  );
};

export default KeywordsDetail;
