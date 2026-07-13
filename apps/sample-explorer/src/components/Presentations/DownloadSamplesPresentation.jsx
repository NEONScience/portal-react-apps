import React, { useReducer } from 'react';
import PropTypes from 'prop-types';

import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import TextField from '@mui/material/TextField';

import CancelIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/SaveAlt';

import NeonEnvironment from 'portal-core-components/lib/components/NeonEnvironment';
import NeonContext from 'portal-core-components/lib/components/NeonContext/NeonContext';
import Theme from 'portal-core-components/lib/components/Theme';

function DownloadSamplesPresentation(props) {
  const {
    sampleUuid,
    cacheControl,
    downloadErrorStr,
    onDownloadClick,
    onDownloadVisitedSamplesClick,
    visitedSamples: {
      sampleViews: visitedSampleViews,
    },
  } = props;

  const neonContextSessionState = NeonContext.useNeonContextSessionState();
  const { canAccessData } = neonContextSessionState;

  const degreeIsValid = d => /^[0-9]+$/.test(d) && Number.parseInt(d, 10) >= 1;

  const initialState = {
    dialogOpen: false,
    downloadType: 'json',
    sampleSelection: null,
    degreeType: 'chosen',
    degree: 1,
    canDownload: false,
  };
  const reducer = (prevState, action) => {
    const newState = { ...prevState };
    const resetCanDownload = () => {
      newState.canDownload = false;
      if (newState.sampleSelection === 'allSamples') {
        newState.canDownload = true;
      } else if (['first', 'current'].includes(newState.sampleSelection)) {
        if (newState.degreeType === 'chosen') {
          newState.canDownload = true;
        } else if (newState.degreeType === 'degree') {
          if (degreeIsValid(newState.degree)) { newState.canDownload = true; }
        }
      }
    };
    switch (action.type) {
      case 'setDialogOpen':
        newState.dialogOpen = !!action.dialogOpen;
        break;
      case 'setDownloadType':
        if (!['json', 'csv'].includes(action.downloadType)) { return prevState; }
        newState.downloadType = action.downloadType;
        resetCanDownload();
        break;
      case 'setSampleSelection':
        if (!['first', 'current', 'allSamples'].includes(action.sampleSelection)) { return prevState; }
        newState.sampleSelection = action.sampleSelection;
        resetCanDownload();
        break;
      case 'setDegreeType':
        if (!['chosen', 'degree'].includes(action.degreeType)) { return prevState; }
        newState.degreeType = action.degreeType;
        resetCanDownload();
        break;
      case 'setDegree':
        newState.degree = action.degree;
        resetCanDownload();
        break;
      default:
        break;
    }
    return newState;
  };
  const [state, dispatch] = useReducer(reducer, initialState);

  const executeDownload = () => {
    if (!state.canDownload) { return null; }
    let sampleList = [];
    switch (state.sampleSelection) {
      case 'first':
        sampleList.push(visitedSampleViews[0]);
        break;
      case 'current':
        for (let i = 0; i < visitedSampleViews.length; i += 1) {
          if (visitedSampleViews[i].sampleUuid === sampleUuid) {
            sampleList.push(visitedSampleViews[i]);
          }
        }
        break;
      case 'allSamples':
        sampleList = visitedSampleViews;
        break;
      default:
        break;
    }
    if (state.sampleSelection === 'allSamples') {
      return onDownloadVisitedSamplesClick(state.downloadType, sampleList);
    } else {
      if (state.degreeType === 'chosen') {
        return onDownloadVisitedSamplesClick(state.downloadType, sampleList);
      } else {
        const headers = {
          ...neonContextSessionState.sessionHeaders
        };
        const url = `${NeonEnvironment.getFullApiPath('samples')}/download?`
          + `sampleTag=${encodeURIComponent(sampleList[0].sampleTag)}`
          + `&sampleClass=${sampleList[0].sampleClass}`
          + `&degree=${state.degree}`;
        return onDownloadClick(state.downloadType, url, cacheControl, headers);
      }
    }
  };

  return (
    <div>
      <Button
        variant="contained"
        color="primary"
        onClick={() => {
          dispatch({
            type: 'setDialogOpen',
            dialogOpen: true,
          });
        }}
        disabled={!canAccessData}
        style={{ marginBottom: Theme.spacing(3), whiteSpace: 'nowrap' }}
        data-selenium="download-samples-button"
      >
        {canAccessData ? 'Download Sample(s)' : 'Login Required' }
        <DownloadIcon fontSize="small" style={{ marginLeft: Theme.spacing(1) }} />
      </Button>
      <Dialog
        open={state.dialogOpen}
        onClose={() => {
          dispatch({
            type: 'setDialogOpen',
            dialogOpen: false,
          });
        }}
        aria-labelledby="download-dialog-title"
        data-selenium="download-samples-dialog"
      >
        <DialogTitle id="download-dialog-title">
          Download Sample(s)
        </DialogTitle>
        <DialogContent>
          <div style={{ display: 'flex', marginBottom: Theme.spacing(3), flexWrap: 'wrap' }}>
            {/* Data Format */}
            <FormControl
              variant="standard"
              component="fieldset"
              style={{ marginRight: Theme.spacing(5) }}
            >
              <FormLabel component="legend">Data format</FormLabel>
              <RadioGroup
                aria-label="data format"
                name="downloadType"
                value={state.downloadType}
                onChange={(event) => {
                  dispatch({
                    type: 'setDownloadType',
                    downloadType: event.target.value,
                  });
                }}
                data-selenium="download-samples-dialog.data-format-radiogroup"
              >
                <FormControlLabel value="json" control={<Radio />} label="JSON" />
                <FormControlLabel value="csv" control={<Radio />} label="CSV" />
              </RadioGroup>
            </FormControl>
            {/* Samples of Interest */}
            <FormControl variant="standard" component="fieldset">
              <FormLabel component="legend">Samples of interest</FormLabel>
              <RadioGroup
                aria-label="samples of interest"
                name="sampleSelection"
                value={state.sampleSelection || ''}
                onChange={(event) => {
                  dispatch({
                    type: 'setSampleSelection',
                    sampleSelection: event.target.value,
                  });
                }}
                data-selenium="download-samples-dialog.samples-of-interest-radiogroup"
              >
                <FormControlLabel value="first" control={<Radio />} label="First visited sample" />
                <FormControlLabel value="current" control={<Radio />} label="Current sample" />
                <FormControlLabel value="allSamples" control={<Radio />} label="All samples visited in session" />
              </RadioGroup>
            </FormControl>
          </div>
          {/* Relationship Extent */}
          {!['first', 'current'].includes(state.sampleSelection) ? null : (
            <div style={{ marginBottom: Theme.spacing(3) }}>
              <FormControl
                variant="standard"
                component="fieldset"
                style={{ marginBottom: Theme.spacing(1) }}
              >
                <FormLabel component="legend">Relationship extent for selected sample</FormLabel>
                <RadioGroup
                  aria-label="relationship extent for selected sample"
                  name="degreeType"
                  value={state.degreeType}
                  onChange={(event) => {
                    dispatch({
                      type: 'setDegreeType',
                      degreeType: event.target.value,
                    });
                  }}
                  data-selenium="download-samples-dialog.relationship-extent-radiogroup"
                >
                  <FormControlLabel value="chosen" control={<Radio />} label="The chosen sample only" />
                  <FormControlLabel
                    value="degree"
                    control={<Radio />}
                    label="The chosen sample plus samples related to degree (1-n)"
                  />
                </RadioGroup>
              </FormControl>
              <FormControl variant="standard" component="fieldset">
                <TextField
                  label="Degrees"
                  autoComplete="on"
                  value={state.degree || ''}
                  variant="outlined"
                  style={{ minWidth: '80px' }}
                  onChange={(event) => {
                    dispatch({
                      type: 'setDegree',
                      degree: event.target.value,
                    });
                  }}
                  error={!degreeIsValid(state.degree)}
                  disabled={state.degreeType !== 'degree'}
                  data-selenium="download-samples-dialog.relationship-extent-degree"
                />
              </FormControl>
            </div>
          )}
          {/* Errors */}
          {!downloadErrorStr ? null : (
            <Alert
              severity="error"
              style={{ marginBottom: Theme.spacing(3) }}
              data-selenium="download-samples-dialog.error"
            >
              <AlertTitle style={{ marginBottom: 0 }}>{downloadErrorStr}</AlertTitle>
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            color="primary"
            variant="outlined"
            onClick={() => {
              dispatch({
                type: 'setDialogOpen',
                dialogOpen: false,
              });
            }}
          >
            Cancel
            <CancelIcon fontSize="small" style={{ marginLeft: Theme.spacing(1) }} />
          </Button>
          <Button
            color="primary"
            variant="contained"
            disabled={!state.canDownload || !canAccessData}
            onClick={() => {
              executeDownload();
              dispatch({
                type: 'setDialogOpen',
                dialogOpen: false,
              });
            }}
          >
            Download
            <DownloadIcon fontSize="small" style={{ marginLeft: Theme.spacing(1) }} />
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

DownloadSamplesPresentation.propTypes = {
  sampleUuid: PropTypes.string.isRequired,
  cacheControl: PropTypes.string.isRequired,
  downloadErrorStr: PropTypes.string,
  onDownloadClick: PropTypes.func.isRequired,
  onDownloadVisitedSamplesClick: PropTypes.func.isRequired,
  visitedSamples: PropTypes.shape({
    // eslint-disable-next-line react/forbid-prop-types
    sampleViews: PropTypes.arrayOf(PropTypes.object).isRequired,
  }).isRequired,
};

export default DownloadSamplesPresentation;
