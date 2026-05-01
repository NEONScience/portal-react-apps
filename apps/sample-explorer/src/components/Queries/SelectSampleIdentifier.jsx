import React, { useRef } from "react";
import PropTypes from 'prop-types';

import makeStyles from '@mui/styles/makeStyles';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

import NeonEnvironment from 'portal-core-components/lib/components/NeonEnvironment';
import Theme from 'portal-core-components/lib/components/Theme';

const useStyles = makeStyles((theme) => ({
  formControl: {
    [theme.breakpoints.down('sm')]: {
      width: '100%',
    },
    [theme.breakpoints.up('sm')]: {
      minWidth: '240px',
    },
  },
}));

function SelectSampleIdentifier(props) {
  const {
    sampleClassDesc,
    onSetQueryType,
    onDownloadSupportedClassesClick,
    query: { queryType, queryTypeOptions },
  } = props;

  const classes = useStyles(Theme);

  const labelRef = useRef(null);

  return (
    <FormControl variant="outlined" className={classes.formControl}>
      <InputLabel id="select-identifier-type-label" ref={labelRef}>Identifier Type</InputLabel>
      <Select
        variant="standard"
        labelId="select-identifier-type-label"
        label={labelRef.current ? labelRef.current.offsetWidth + 8 : 0}
        data-gtm="sample-search-form.select-identifier-type"
        data-selenium="sample-search-form.select-identifier-type"
        value={queryType}
        onChange={(event) => {
          onSetQueryType(event.target.value);
          if (sampleClassDesc.size === 0) {
            const url = `${NeonEnvironment.getFullApiPath('samples')}/supportedClasses`;
            onDownloadSupportedClassesClick(url, true, false);
          }
        }}
      >
        {queryTypeOptions.map((option) => (
          <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

SelectSampleIdentifier.propTypes = {
  sampleClassDesc: PropTypes.instanceOf(Map).isRequired,
  onSetQueryType: PropTypes.func.isRequired,
  onDownloadSupportedClassesClick: PropTypes.func.isRequired,
  query: PropTypes.shape({
    queryType: PropTypes.string.isRequired,
    queryTypeOptions: PropTypes.arrayOf(
      PropTypes.shape({
        value: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
      }),
    ).isRequired,
  }).isRequired,
};

export default SelectSampleIdentifier;
