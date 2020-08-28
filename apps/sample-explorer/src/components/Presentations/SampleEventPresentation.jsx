import React from 'react';

import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

import DownloadIcon from '@material-ui/icons/SaveAlt';

import Theme from 'portal-core-components/lib/components/Theme';

import SampleInfoPresentation from './SampleInfoPresentation';
import DownloadSamplesPresentation from './DownloadSamplesPresentation';
import DataGrid from '../DataGrid/DataGrid';

import { smsFields } from '../../util/appUtil';

import 'font-awesome/css/font-awesome.min.css';

const fileDownload = require('js-file-download');
const { Parser } = require('json2csv');

const SampleEventPresentation = (props) => {
  const downloadPossibleSMSFields = () => {
    let headers = ['SMS Field Name', 'Description'];
    let csvData = [];
    for (let [key, value] of smsFields) {
      let row = [];
      row = Object.assign(row, { 'SMS Field Name': key });
      row = Object.assign(row, { 'Description': value });
      csvData.push(row);
    }
    let jsonParser = new Parser({ fields: headers });
    let csvResult = jsonParser.parse(csvData);
    fileDownload(csvResult, 'smsFieldNames.csv');
  };

  return (
    <div style={{ marginBottom: Theme.spacing(5) }} data-selenium="sample-events-section">
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
        <DataGrid {...props} />
      </div>
      <div style={{ marginBottom: Theme.spacing(3), display: 'flex', flexWrap: 'wrap' }}>
        <Button
          style={{ marginRight: Theme.spacing(3), whiteSpace: 'nowrap' }}
          variant="outlined"
          color="primary"
          onClick={downloadPossibleSMSFields}
          data-selenium="download-sms-fields-list-button"
        >
          Download Possible SMS Fields List
          <DownloadIcon fontSize="small" style={{ marginLeft: Theme.spacing(1) }} />
        </Button>
        <DownloadSamplesPresentation {...props} />
      </div>
    </div>
  );
};

export default SampleEventPresentation;
