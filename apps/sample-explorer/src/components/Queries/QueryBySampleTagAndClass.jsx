import React from 'react';
import PropTypes from 'prop-types';

import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

import NeonEnvironment from 'portal-core-components/lib/components/NeonEnvironment';
import { makeStyles } from 'portal-core-components/lib/components/Theme/makeStyles';

import { QUERY_TYPE } from '../../util/queryUtil';

const useStyles = makeStyles()((theme) => ({
  formControl: {
    [theme.breakpoints.down('sm')]: {
      width: '100%',
    },
    [theme.breakpoints.up('sm')]: {
      minWidth: '400px',
    },
  },
}));

function QueryBySampleTagAndClass(props) {
  const {
    cacheControl,
    onQueryClick,
    onSetQuerySampleClass,
    query: {
      queryType,
      queryErrorStr,
      sampleTag,
      sampleClass,
      sampleClasses,
      queryIsLoading,
    },
  } = props;

  const { classes } = useStyles();

  if (queryType !== QUERY_TYPE.SAMPLE_TAG) { return null; }

  return (
    <FormControl
      variant="outlined"
      className={classes.formControl}
      error={/sample class/i.test(queryErrorStr)}
    >
      <InputLabel id="select-sample-class-label">Sample Class</InputLabel>
      <Select
        labelId="select-sample-class-label"
        label="Sample Class"
        data-gtm="sample-search-form.select-sample-class"
        data-selenium="sample-search-form.select-sample-class"
        value={sampleClass || ''}
        disabled={!sampleClasses.length || queryIsLoading}
        SelectDisplayProps={sampleClasses.length ? null : { style: { cursor: 'not-allowed' } }}
        onChange={(event) => {
          const appliedSampleClass = event.target.value;
          onSetQuerySampleClass(appliedSampleClass);
          const appliedSampleTag = sampleTag ? sampleTag.trim() : '';
          const url = `${NeonEnvironment.getFullApiPath('samples')}/view`
            + `?sampleTag=${encodeURIComponent(appliedSampleTag)}`
            + `&sampleClass=${encodeURIComponent(appliedSampleClass)}`;
          onQueryClick(url, cacheControl);
        }}
      >
        {sampleClasses.length ? sampleClasses.map((option) => (
          <MenuItem key={option} value={option}>{option}</MenuItem>
        )) : (
          <MenuItem value="">--</MenuItem>
        )}
      </Select>
    </FormControl>
  );
}

QueryBySampleTagAndClass.propTypes = {
  cacheControl: PropTypes.string.isRequired,
  onQueryClick: PropTypes.func.isRequired,
  onSetQuerySampleClass: PropTypes.func.isRequired,
  query: PropTypes.shape({
    queryType: PropTypes.string.isRequired,
    queryErrorStr: PropTypes.string,
    sampleTag: PropTypes.string,
    sampleClass: PropTypes.string,
    sampleClasses: PropTypes.arrayOf(PropTypes.string),
    queryIsLoading: PropTypes.bool,
  }).isRequired,
};

export default QueryBySampleTagAndClass;
