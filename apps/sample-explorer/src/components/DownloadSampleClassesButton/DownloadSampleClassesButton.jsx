import React from "react";

import Button from '@material-ui/core/Button';
import DownloadIcon from '@material-ui/icons/SaveAlt';

import NeonEnvironment from 'portal-core-components/lib/components/NeonEnvironment';
import Theme from 'portal-core-components/lib/components/Theme';

const DownloadSampleClassesButton = (props) => {
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
};

export default DownloadSampleClassesButton;
