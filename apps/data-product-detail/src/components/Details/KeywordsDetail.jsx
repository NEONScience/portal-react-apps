import React from 'react';

import { makeStyles } from '@material-ui/core/styles';

import Chip from '@material-ui/core/Chip';

import Theme from 'portal-core-components/lib/components/Theme';

import Detail from './Detail';
import DataProductContext from '../DataProductContext';

const useStyles = makeStyles((theme) => ({
  chip: {
    marginRight: theme.spacing(0.5),
    marginBottom: theme.spacing(0.5),
    maxWidth: '-webkit-fill-available',
  },
  chipMoz: {
    maxWidth: '-moz-available',
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
      <div style={{ overflowX: 'hidden' }}>
        {(keywords || []).length ? keywords.map((keyword) => (
          <Chip
            label={keyword}
            key={keyword}
            size="small"
            className={`${classes.chip} ${classes.chipMoz}`}
          />
        )) : (
          <i>n/a</i>
        )}
      </div>
    </Detail>
  );
};

export default KeywordsDetail;
