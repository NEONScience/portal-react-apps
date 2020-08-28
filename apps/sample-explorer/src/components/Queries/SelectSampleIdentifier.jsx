import React, { useRef } from "react";

import { makeStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

import Theme from 'portal-core-components/lib/components/Theme';

import { getFullSamplesApiPath } from "../../util/envUtil";

const useStyles = makeStyles((theme) => ({
  formControl: {
    [theme.breakpoints.down('xs')]: {
      width: '100%',      
    },
    [theme.breakpoints.up('sm')]: {
      minWidth: '240px'
    },
  },
}));

const SelectSampleIdentifier = (props) => {
  const {
    sampleClassDesc,
    onSetQueryType,
    onDownloadSupportedClassesClick,
    query: { queryType, queryTypeOptions,  },
  } = props;

  const classes = useStyles(Theme);

  const labelRef = useRef(null);

  return (
    <FormControl variant="outlined" className={classes.formControl}>
      <InputLabel id="select-sample-identifier-label" ref={labelRef}>Sample Identifier</InputLabel>
      <Select
        labelId="select-sample-identifier-label"
        labelWidth={labelRef.current ? labelRef.current.offsetWidth + 8 : 0}
        data-selenium="select-sample-identifier"
        value={queryType}
        onChange={(event) => {
          onSetQueryType(event.target.value);
          if (sampleClassDesc.size === 0) {
            const url = `${getFullSamplesApiPath()}/supportedClasses`;
            onDownloadSupportedClassesClick(url, true, false);
          }
        }}
      >
        {queryTypeOptions.map(option => (
          <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default SelectSampleIdentifier;
