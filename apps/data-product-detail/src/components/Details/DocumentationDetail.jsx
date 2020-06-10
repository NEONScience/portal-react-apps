import React, { useContext } from 'react';

import { makeStyles } from '@material-ui/core/styles';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import DocumentIcon from '@material-ui/icons/DescriptionOutlined';

import NeonEnvironment from 'portal-core-components/lib/components/NeonEnvironment';
import Theme from 'portal-core-components/lib/components/Theme';

import Detail from './Detail';

import { StoreContext } from '../../Store';

const useStyles = makeStyles(theme => ({
  list: {
    paddingTop: theme.spacing(0),
  },
  listItem: {
    paddingLeft: theme.spacing(1),
  },
  listItemIcon: {
    minWidth: theme.spacing(4),
  },
}));

const DocumentationDetail = () => {
  const { state } = useContext(StoreContext);
  const classes = useStyles(Theme);

  const renderDocument = (spec) => {
    const apiPath = `${NeonEnvironment.getFullApiPath('documents')}/${spec.specNumber}`;
    return (
      <ListItem
        key={spec.specId}
        className={classes.listItem}
        component="a"
        href={apiPath}
        button
      >
        <ListItemIcon className={classes.listItemIcon}>
          <DocumentIcon />
        </ListItemIcon>
        <ListItemText primary={spec.specNumber} />
      </ListItem>
    );
  };

  const { specs } = state.product;

  return (
    <Detail
      title="Documentation"
    >
      {(specs || []).length ? (
        <List dense className={classes.list}>
          {specs.map(renderDocument)}
        </List>
      ) : (
        <i>n/a</i>
      )}
    </Detail>
  );
};

export default DocumentationDetail;
