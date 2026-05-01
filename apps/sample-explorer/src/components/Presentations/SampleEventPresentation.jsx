/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';

import Typography from '@mui/material/Typography';

import Theme from 'portal-core-components/lib/components/Theme';

import SampleInfoPresentation from './SampleInfoPresentation';
import DownloadSamplesPresentation from './DownloadSamplesPresentation';
import DataGrid from '../DataGrid/DataGrid';
import SampleSmsFieldsDialog from './SampleSmsFieldsDialog';

function SampleEventPresentation(props) {
  const { tableDefinition, tableData, sampleUuid } = props;
  return (
    <div style={{ marginBottom: Theme.spacing(3) }} data-selenium="sample-events-section">
      <Typography variant="h4" gutterBottom>
        Sample Events
      </Typography>
      <Typography variant="subtitle1">
        History of Sample Custody Events along with all Sample Management
        System (SMS) fields (taxon excepted) available for the focal sample tag.
      </Typography>
      <div style={{ margin: Theme.spacing(3, 0) }}>
        <SampleInfoPresentation {...props} />
      </div>
      <div style={{ marginBottom: Theme.spacing(3) }}>
        <DataGrid
          columnDefs={tableDefinition}
          rowData={tableData}
          uuid={sampleUuid}
        />
      </div>
      <div style={{ marginBottom: Theme.spacing(3), display: 'flex', flexWrap: 'wrap' }}>
        <DownloadSamplesPresentation {...props} />
        <SampleSmsFieldsDialog {...props} />
      </div>
    </div>
  );
}

SampleEventPresentation.propTypes = {
  tableDefinition: PropTypes.arrayOf(PropTypes.any).isRequired,
  tableData: PropTypes.arrayOf(PropTypes.any).isRequired,
  sampleUuid: PropTypes.string.isRequired,
};

export default SampleEventPresentation;
