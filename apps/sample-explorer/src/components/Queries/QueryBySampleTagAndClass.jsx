import React, { useRef } from "react";

import { makeStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

import Theme from 'portal-core-components/lib/components/Theme';

import { QUERY_TYPE } from "../../util/queryUtil";
import { getFullSamplesApiPath } from "../../util/envUtil";

const useStyles = makeStyles((theme) => ({
  formControl: {
    [theme.breakpoints.down('xs')]: {
      width: '100%',      
    },
    [theme.breakpoints.up('sm')]: {
      minWidth: '400px'
    },
  },
}));

const QueryBySampleTagAndClass = (props) => {
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

  const classes = useStyles(Theme);

  const labelRef = useRef(null);

  if (queryType !== QUERY_TYPE.SAMPLE_TAG) { return null; }

  return (
    <FormControl
      variant="outlined"
      className={classes.formControl}
      error={/sample class/i.test(queryErrorStr)}
    >
      <InputLabel id="select-sample-class-label" ref={labelRef}>Sample Class</InputLabel>
      <Select
        labelId="select-sample-class-label"
        labelWidth={labelRef.current ? labelRef.current.offsetWidth + 8 : 0}
        data-gtm="sample-search-form.select-sample-class"
        data-selenium="sample-search-form.select-sample-class"
        value={sampleClass || ''}
        disabled={!sampleClasses.length || queryIsLoading}
        SelectDisplayProps={sampleClasses.length ? null : { style: { cursor: 'not-allowed' }}}
        onChange={(event) => {
          const appliedSampleClass = event.target.value;
          onSetQuerySampleClass(appliedSampleClass);
          const appliedSampleTag = sampleTag ? sampleTag.trim() : '';
          const url = `${getFullSamplesApiPath()}/view`
            + `?sampleTag=${encodeURIComponent(appliedSampleTag)}`
            + `&sampleClass=${encodeURIComponent(appliedSampleClass)}`;
          onQueryClick(url, cacheControl);
        }}
      >
        {sampleClasses.length ? sampleClasses.map(option => (
          <MenuItem key={option} value={option}>{option}</MenuItem>
        )) : (
          <MenuItem value="">--</MenuItem>
        )}
      </Select>
    </FormControl>
  );
};

export default QueryBySampleTagAndClass;
