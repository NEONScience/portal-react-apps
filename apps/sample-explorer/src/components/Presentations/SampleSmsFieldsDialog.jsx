import React, { useReducer } from 'react';

import { fetch as fetchPolyfill } from "whatwg-fetch";

import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@mui/material/Grid';

import CancelIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/SaveAlt';

import NeonApi from "portal-core-components/lib/components/NeonApi";
import NeonEnvironment from 'portal-core-components/lib/components/NeonEnvironment';
import Theme from 'portal-core-components/lib/components/Theme';
import DataGrid from '../DataGrid/DataGrid';

const fileDownload = require("js-file-download");
const { Parser } = require("json2csv");

const COLUMN_DEFS = [
  {
    headerName: "SMS Field Name",
    field: "name",
    sortable: true,
    resizable: true,
    filter: true,
  },
  {
    headerName: "SMS Field Description",
    field: "description",
    sortable: true,
    resizable: true,
    filter: true,
  },
  {
    headerName: "SMS Field Ontology Mapping",
    field: "ontologyMapping",
    sortable: true,
    resizable: true,
    filter: true,
  },
];

const downloadFields = (fields, dispatch) => {
  const smsFieldHeaders = [
    "SMS Field Name",
    "SMS Field Description",
    "SMS Field Ontology Mapping",
  ];
  dispatch({ type: 'downloading' });
  const fieldsCsvData = [];
  fields.forEach((value) => {
    fieldsCsvData.push({
      "SMS Field Name": value.name,
      "SMS Field Description": value.description,
      "SMS Field Ontology Mapping": value.ontologyMapping,
    });
  });
  try {
    const fieldsParser = new Parser({ fields: smsFieldHeaders });
    const fieldsCsvResult = fieldsParser.parse(fieldsCsvData);
    fileDownload(fieldsCsvResult, "Sample-Explorer-SMS-Fields.csv");
    dispatch({ type: 'downloaded' });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    dispatch({ type: 'downloadError' });
  }
};

const checkStatus = (response) => {
  if (typeof response === "undefined") {
    const error = new Error("Error occurred");
    error.response = null;
    throw error;
  }
  if (response.status >= 200 && response.status < 300) {
    return response;
  }
  const error = new Error(response.statusText);
  error.response = response;
  throw error;
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
    mode: 'cors',
    credentials: NeonEnvironment.requireCors() ? 'include' : 'same-origin',
    headers: {
      Accept: "application/json",
      ...NeonApi.getApiTokenHeader(),
    },
  };
  const url = `${NeonEnvironment.getFullApiPath('samples')}/supported-sms-fields`;
  const fetchFunc = getFetch();
  dispatch({ type: 'fetchingFields' });
  fetchFunc(url, fetchInit)
    .then(checkStatus)
    .then((response) => {
      if (!response.ok) {
        const error = new Error(response.statusText);
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
      // eslint-disable-next-line no-console
      console.error(error);
      dispatch({ type: 'fetchError' });
    });
};

function SampleSmsFieldsDialog() {
  const initialState = {
    dialogOpen: false,
    fields: [],
    isFetching: false,
    isErrorState: false,
    isDownloading: false,
  };
  const reducer = (prevState, action) => {
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
      // eslint-disable-next-line react/jsx-no-useless-fragment
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
}

export default SampleSmsFieldsDialog;
