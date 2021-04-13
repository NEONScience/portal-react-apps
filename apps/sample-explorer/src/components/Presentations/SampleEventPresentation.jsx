import React from 'react';

import Typography from '@material-ui/core/Typography';

import Theme from 'portal-core-components/lib/components/Theme';

import SampleInfoPresentation from './SampleInfoPresentation';
import DownloadSamplesPresentation from './DownloadSamplesPresentation';
import DataGrid from '../DataGrid/DataGrid';
import SampleSmsFieldsDialog from './SampleSmsFieldsDialog';

const SampleEventPresentation = (props) => {
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
        <SampleInfoPresentation  {...props} />
      </div>
      <div style={{ marginBottom: Theme.spacing(3) }}>
        <DataGrid 
          columnDefs={props.tableDefinition}
          rowData={props.tableData}
          uuid={props.sampleUuid}
        />
      </div>
      <div style={{ marginBottom: Theme.spacing(3), display: 'flex', flexWrap: 'wrap' }}>
        <DownloadSamplesPresentation {...props} />
        <SampleSmsFieldsDialog {...props} />
      </div>
    </div>
  );
};

export default SampleEventPresentation;
