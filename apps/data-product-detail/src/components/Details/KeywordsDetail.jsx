import React from 'react';

import { makeStyles } from '@material-ui/core/styles';

import Chip from '@material-ui/core/Chip';

import Theme from 'portal-core-components/lib/components/Theme';

import Detail from './Detail';
import DataProductContext from '../DataProductContext';

const useStyles = makeStyles(theme => ({
  chip: {
    marginRight: theme.spacing(0.5),
    marginBottom: theme.spacing(0.5),
  },
}));

const KeywordsDetail = () => {
  const classes = useStyles(Theme);
  const [state] = DataProductContext.useDataProductContextState();
  const product = DataProductContext.getCurrentProductFromState(state);

  const { keywords } = product;

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
