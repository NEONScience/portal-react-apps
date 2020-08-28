import React from "react";

import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';

import Theme from 'portal-core-components/lib/components/Theme';

const useStyles = makeStyles((theme) => ({
  textField: {
    [theme.breakpoints.down('xs')]: {
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
    query: { sampleTag, queryErrorStr },
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
      data-selenium="sample-search-form.sample-tag"
    />
  );
};

export default QueryBySampleTag;
