import React from 'react';

import { makeStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Tooltip from '@material-ui/core/Tooltip';

import DownloadIcon from '@material-ui/icons/SaveAlt';

import Theme from 'portal-core-components/lib/components/Theme';
import { existsNonEmpty, isStringNonEmpty } from 'portal-core-components/lib/util/typeUtil';

import DataProductContext from '../DataProductContext';
import Detail from './Detail';

const useStyles = makeStyles((theme) => ({
  list: {
    padding: theme.spacing(0),
    marginTop: theme.spacing(-1),
    marginBottom: theme.spacing(1),
    maxHeight: '440px',
    overflowY: 'scroll',
  },
  listItemLink: {
    borderRadius: theme.spacing(0.5),
    border: '0.5px solid #ffffff00',
    '&:hover': {
      border: `0.5px solid ${theme.palette.primary.main}`,
    },
  },
  listItemLinkSecondary: {
    '& p': {
      color: theme.palette.primary.main,
      textDecoration: 'underline',
      marginTop: theme.spacing(0.5),
      '&:hover': {
        color: Theme.colors.LIGHT_BLUE[400],
      },
    },
  },
}));

const downloadCollection = (url) => {
  if (!isStringNonEmpty(url)) {
    return;
  }
  try {
    const link = window.document.createElement('a');
    link.href = url;
    link.setAttribute('download', url);
    link.setAttribute('rel', 'noopener noreferrer');
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
  }
};

const BioRepoCollectionsDetail = () => {
  const classes = useStyles(Theme);
  const [state] = DataProductContext.useDataProductContextState();
  const product = DataProductContext.getCurrentProductFromState(state);
  const { biorepositoryCollections: collections } = product;
  if (!existsNonEmpty(collections)) {
    return null;
  }
  return (
    <Detail title="Biorepository Collections">
      <List dense className={classes.list}>
        {collections.map((collection) => {
          const {
            collectionCode,
            collectionName,
            collectionContentUrl,
            collectionDownloadUrl,
          } = collection;
          const showDownload = isStringNonEmpty(collectionDownloadUrl);
          if (!isStringNonEmpty(collectionCode) || !isStringNonEmpty(collectionName)) {
            return null;
          }
          return (
            <ListItem
              key={`${collectionCode}-${collectionName}`}
              className={`${classes.listItemLink} ${classes.listItemLinkSecondary}`}
              component="a"
              href={collectionContentUrl}
              target="_blank"
              rel="noopener noreferrer"
              button
            >
              <ListItemText primary={collectionName} secondary={collectionCode} />
              {!showDownload ? null : (
                <ListItemSecondaryAction>
                  <Tooltip
                    style={{ flex: 0 }}
                    placement="left"
                    title="Download collection"
                  >
                    <IconButton
                      color="primary"
                      onClick={() => { downloadCollection(collectionDownloadUrl); }}
                    >
                      <DownloadIcon />
                    </IconButton>
                  </Tooltip>
                </ListItemSecondaryAction>
              )}
            </ListItem>
          );
        })}
      </List>
    </Detail>
  );
};

export default BioRepoCollectionsDetail;
