import React, { useReducer } from 'react';
import DataGrid from '../DataGrid/DataGrid';
import { fetch as fetchPolyfill } from "whatwg-fetch";

import Alert from '@material-ui/lab/Alert';
import AlertTitle from '@material-ui/lab/AlertTitle';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Grid from '@material-ui/core/Grid';

import CancelIcon from '@material-ui/icons/Close';
import DownloadIcon from '@material-ui/icons/SaveAlt';

import NeonApi from "portal-core-components/lib/components/NeonApi";
import Theme from 'portal-core-components/lib/components/Theme';

import { getFullSamplesApiPath } from "../../util/envUtil";

import 'font-awesome/css/font-awesome.min.css';

const fileDownload = require("js-file-download");
const { Parser } = require("json2csv");

const COLUMN_DEFS = [
  { 
    headerName: "SMS Field Name", 
    field: "name", 
    sortable: true, 
    resizable: true, 
    filter: true 
  },
  { 
    headerName: "SMS Field Description", 
    field: "description", 
    sortable: true, 
    resizable: true, 
    filter: true 
  },
  { 
    headerName: "SMS Field Ontology Mapping", 
    field: "ontologyMapping", 
    sortable: true, 
    resizable: true, 
    filter: true 
  },
];

const downloadFields = (fields, dispatch) => {
  let smsFieldHeaders = [
    "SMS Field Name", 
    "SMS Field Description", 
    "SMS Field Ontology Mapping",
  ];
  dispatch({ type: 'downloading' });
  let fieldsCsvData = [];
  fields.forEach((value) => {
    fieldsCsvData.push({
      "SMS Field Name": value.name,
      "SMS Field Description": value.description,
      "SMS Field Ontology Mapping": value.ontologyMapping,
    });
  });
  try {
    let fieldsParser = new Parser({ fields: smsFieldHeaders });
    let fieldsCsvResult = fieldsParser.parse(fieldsCsvData);
    fileDownload(fieldsCsvResult, "Sample-Explorer-SMS-Fields.csv");
    dispatch({ type: 'downloaded' });
  } catch (e) {
    console.error(e);
    dispatch({ type: 'downloadError' });
  }
};

const checkStatus = (response) => {
  if (typeof response === "undefined") {
    let error = new Error("Error occurred");
    error.response = null;
    throw error;
  }
  if (response.status >= 200 && response.status < 300) {
    return response;
  } else {
    let error = new Error(response.statusText);
    error.response = response;
    throw error;
  }
};

const getFetch = () => {
  let fetchFunc = fetch;
  if (typeof fetchFunc === "undefined") {
    fetchFunc = fetchPolyfill;
  }
  return fetchFunc;
};

const fetchFields = (dispatch) => {
  const fetchInit = {
    method: "GET",
    headers: {
      Accept: "application/json",
      ...NeonApi.getApiTokenHeader()
    },
  };
  const url = `${getFullSamplesApiPath()}/supported-sms-fields`;
  let fetchFunc = getFetch();
  dispatch({ type: 'fetchingFields' });
  fetchFunc(url, fetchInit)
    .then(checkStatus)
    .then((response) => {
      if (!response.ok) {
        var error = new Error(response.statusText);
        error.response = response;
        throw error;
      }
      return response;
    })
    .then((response) => response.json())
    .then((json) => {
      let fields = [];
      if ((json !== null) && (json.data !== null) 
          && Array.isArray(json.data.smsFields)) {
        fields = json.data.smsFields;
      }
      dispatch({ type: 'fetchCompleted', fields });
    })
    .catch((error) => {
      console.error(error);
      dispatch({ type: 'fetchError' });
    });
};

const SampleSmsFieldsDialog = () => {
  const initialState = {
    dialogOpen: false,
    fields: [],
    isFetching: false,
    isErrorState: false,
    isDownloading: false,
  };
  const reducer = (prevState, action) =>{
    const next = { ...prevState };
    switch (action.type) {
      case 'dialogOpen':
        next.dialogOpen = true;
        break;
      case 'fetchingFields':
        next.isFetching = true;
        break;
      case 'fetchCompleted':
        next.isFetching = false;
        next.isErrorState = false;
        next.fields = action.fields;
        break;
      case 'fetchError':
        next.isFetching = false;
        next.isErrorState = true;
        break;
      case 'downloading':
        next.isDownloading = true;
        break;
      case 'downloaded':
        next.isDownloading = false;
        next.isErrorState = false;
        break;
      case 'downloadError':
        next.isDownloading = false;
        next.isErrorState = true;
        break;
      case 'resetState':
        return { ...initialState };
      default:
        break;
    }
    return next;
  };
  const [state, dispatch] = useReducer(reducer, initialState);
  const renderErrors = () => {
    if (!state.isErrorState) {
      return <React.Fragment />;
    }
    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Alert 
            severity="error" 
            style={{ margin: Theme.spacing(0, 3, 3, 0), whiteSpace: 'nowrap' }}
            data-selenium="download-sms-fields-dialog.error"
          >
            <AlertTitle>Error</AlertTitle>
            An error occurred when fetching the SMS fields.
          </Alert>
        </Grid>
      </Grid>
    );
  };
  return (
    <div style={{ margin: Theme.spacing(0, 3, 3, 3) }}>
      <Button
        style={{ margin: Theme.spacing(0, 3, 2, 0), whiteSpace: 'nowrap' }}
        variant="outlined"
        color="primary"
        data-selenium="download-sms-fields-list-button"
        onClick={() => {
          dispatch({ type: 'dialogOpen' });
          fetchFields(dispatch);
        }}
      >
        Download SMS Fields
        <DownloadIcon fontSize="small" style={{ marginLeft: Theme.spacing(1) }} />
      </Button>
      <Dialog
        fullWidth
        maxWidth="lg"
        open={state.dialogOpen}
        onClose={() => {
          dispatch({ type: 'resetState' });
        }}
        aria-labelledby="download-sms-fields-dialog-title"
        data-selenium="download-sms-fields-dialog"
      >
        <DialogTitle id="download-sms-fields-dialog-title">
          Download SMS Fields
        </DialogTitle>
        <DialogContent dividers>
          {renderErrors()}
          <DataGrid
            height="600px"
            columnDefs={COLUMN_DEFS}
            rowData={state.fields}
            isLoading={state.isFetching}
          />
        </DialogContent>
        <DialogActions>
          <Button
            style={{ margin: Theme.spacing(0, 3, 2, 0), whiteSpace: 'nowrap' }}
            color="primary"
            variant="outlined"
            onClick={() => {
              dispatch({ type: 'resetState' });
            }}
          >
            Close
            <CancelIcon fontSize="small" style={{ marginLeft: Theme.spacing(1) }} />
          </Button>
          <Button
            style={{ margin: Theme.spacing(0, 3, 2, 0), whiteSpace: 'nowrap' }}
            color="primary"
            variant="contained"
            disabled={state.isErrorState || (state.fields.length <= 0)}
            onClick={() => downloadFields(state.fields, dispatch)}
            data-selenium="download-sms-fields-dialog-button"
          >
            Download
            <DownloadIcon fontSize="small" style={{ marginLeft: Theme.spacing(1) }} />
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default SampleSmsFieldsDialog;
