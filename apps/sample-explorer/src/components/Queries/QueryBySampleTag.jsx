import React from "react";

import makeStyles from '@mui/styles/makeStyles';
import TextField from '@mui/material/TextField';

import Theme from 'portal-core-components/lib/components/Theme';

const useStyles = makeStyles((theme) => ({
  textField: {
    [theme.breakpoints.down('sm')]: {
      width: '100%',
    },
    [theme.breakpoints.up('sm')]: {
      minWidth: '440px'
    },
  },
}));

const QueryBySampleTag = (props) => {
  const {
    onSetQuerySampleTag,
    query: { sampleTag, queryErrorStr, queryIsLoading },
  } = props;

  const classes = useStyles(Theme);

  return (
    <TextField
      label="Sample Tag"
      autoComplete="on"
      value={sampleTag || ''}
      variant="outlined"
      onChange={(e) => onSetQuerySampleTag(e.target.value)}
      className={classes.textField}
      error={queryErrorStr !== null && queryErrorStr !== 'success'}
      disabled={queryIsLoading}
      data-gtm="sample-search-form.sample-identifier"
      data-selenium="sample-search-form.sample-tag"
    />
  );
};

export default QueryBySampleTag;
