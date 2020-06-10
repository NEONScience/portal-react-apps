import React, { useContext } from 'react';

import { makeStyles } from '@material-ui/core/styles';

import Chip from '@material-ui/core/Chip';

import Theme from 'portal-core-components/lib/components/Theme';

import Detail from './Detail';

import { StoreContext } from '../../Store';

const useStyles = makeStyles(theme => ({
  chip: {
    marginRight: theme.spacing(0.5),
    marginBottom: theme.spacing(0.5),
  },
}));

const KeywordsDetail = () => {
  const { state } = useContext(StoreContext);
  const classes = useStyles(Theme);

  const { keywords } = state.product;

  return (
    <Detail
      title="Scientific Keywords"
    >
      {(keywords || []).length ? keywords.map(keyword => (
        <Chip
          label={keyword}
          key={keyword}
          size="small"
          className={classes.chip}
        />
      )) : (
        <i>n/a</i>
      )}
    </Detail>
  );
};

export default KeywordsDetail;
