import React from "react";
import PropTypes from 'prop-types';

import Button from '@mui/material/Button';
import DownloadIcon from '@mui/icons-material/SaveAlt';

import NeonEnvironment from 'portal-core-components/lib/components/NeonEnvironment';
import Theme from 'portal-core-components/lib/components/Theme';

function DownloadSampleClassesButton(props) {
  const {
    sampleClassDesc,
    onDownloadSupportedClassesClick,
  } = props;

  const downloadSupportedSampleClasses = () => {
    if (sampleClassDesc.size === 0) {
      const url = `${NeonEnvironment.getFullApiPath('samples')}/supportedClasses`;
      onDownloadSupportedClassesClick(url, true, true);
    } else {
      onDownloadSupportedClassesClick(null, false, true);
    }
  };

  return (
    <Button
      variant="outlined"
      color="primary"
      onClick={downloadSupportedSampleClasses}
      data-selenium="download-sample-classes-button"
    >
      Download current list of supported sample classes
      <DownloadIcon fontSize="small" style={{ marginLeft: Theme.spacing(1) }} />
    </Button>
  );
}

DownloadSampleClassesButton.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  sampleClassDesc: PropTypes.object.isRequired,
  onDownloadSupportedClassesClick: PropTypes.func.isRequired,
};

export default DownloadSampleClassesButton;
