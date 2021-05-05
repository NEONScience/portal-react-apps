import React, { useReducer } from 'react';

import Alert from '@material-ui/lab/Alert';
import AlertTitle from '@material-ui/lab/AlertTitle';
import Button from "@material-ui/core/Button";
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import TextField from '@material-ui/core/TextField';

import CancelIcon from '@material-ui/icons/Close';
import DownloadIcon from '@material-ui/icons/SaveAlt';

import Theme from 'portal-core-components/lib/components/Theme';

import { getFullSamplesApiPath } from "../../util/envUtil";

const DownloadSamplesPresentation = (props) => {
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
      } else if (['first', 'current'].includes(newState.sampleSelection)){
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
    };
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
        for (let i = 0; i < visitedSampleViews.length; i++) {
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
        const url = `${getFullSamplesApiPath()}/download?`
          + `sampleTag=${encodeURIComponent(sampleList[0].sampleTag)}`
          + `&sampleClass=${sampleList[0].sampleClass}`
          + `&degree=${state.degree}`;
        return onDownloadClick(state.downloadType, url, cacheControl);
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
        style={{ marginBottom: Theme.spacing(3), whiteSpace: 'nowrap' }}
        data-selenium="download-samples-button"
      >
        Download Sample(s)
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
            <FormControl component="fieldset" style={{ marginRight: Theme.spacing(5) }}>
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
            <FormControl component="fieldset">
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
              <FormControl component="fieldset" style={{ marginBottom: Theme.spacing(1) }}>
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
              <FormControl component="fieldset">
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
            disabled={!state.canDownload}
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
  /*
  render() {
    let degreeStyle = {
      width: 50
    }

    let errorDiv
    if (this.props.downloadErrorStr !== "") {
      errorDiv = <div><b><font color="#337ab7">{this.props.downloadErrorStr}</font></b></div>
    } else {
      errorDiv = <div></div>
    }

    let degreeDiv
    if (this.state.sampleSelection === "first" || this.state.sampleSelection === "current") {
      let degreeBox
      if (this.state.degreeType === "degree") {
        degreeBox = <input type="text" onChange={this.setDegree.bind(this)} style={degreeStyle} ref="degree" />
      } else {
        degreeBox = <div></div>
      }
      degreeDiv =
        <div>
          <br></br>
          Choose relationship extent for selected sample(must select one):
                <br></br>
          <input type="checkbox" value="chosen" onChange={this.setDegreeType.bind(this)}
            checked={this.state.degreeType === "chosen"} />The chosen sample only
                <br></br>
          <input type="checkbox" value="degree" onChange={this.setDegreeType.bind(this)}
            checked={this.state.degreeType === "degree"}
          />The chosen sample plus samples related to degree(1-n):
                {degreeBox}
        </div>

    } else {
      degreeDiv = <div></div>
    }

    let buttonDiv
    if (this.state.sampleSelection !== "") {
      if ((this.state.degreeType === "degree"
        && this.state.degree !== "") || this.state.degreeType === "chosen") {
        buttonDiv =
          <div>
            <Button variant="contained" color="primary" onClick={() => {
              let sampleList = []
              let visitedSamples = this.props.visitedSamples.sampleViews
              let currentUuid = this.props.sampleUuid
              switch (this.state.sampleSelection) {
                case "first":
                  sampleList.push(visitedSamples[0])
                  break;
                case "current":
                  for (let i = 0; i < visitedSamples.length; i++) {
                    if (visitedSamples[i].sampleUuid === currentUuid) {
                      sampleList.push(visitedSamples[i])
                    }
                  }
                  break;
                case "allSamples":
                  sampleList = visitedSamples;
                  break;
                default:
                  break;
              }
              if (this.state.sampleSelection === "allSamples") {
                return this.props.onDownloadVisitedSamplesClick(this.state.downloadType, sampleList);
              } else {
                if (this.state.degreeType === "chosen") {
                  return this.props.onDownloadVisitedSamplesClick(this.state.downloadType, sampleList);
                } else {
                  let url = getFullSamplesApiPath() + "/download?";
                  url = url + "sampleTag=" + encodeURIComponent(sampleList[0].sampleTag) +
                    "&sampleClass=" + sampleList[0].sampleClass + "&degree=" + this.refs.degree.value
                  return this.props.onDownloadClick(this.state.downloadType, url, this.props.cacheControl);
                }
              }
            }}>Download
                </Button>
          </div>

      } else {
        buttonDiv = <div></div>
      }
    }

    return (
      <div id="download-samples-presentation">
        <Typography variant="h4">
          Download Sample(s)
        </Typography>
        <br></br>
        Data Format
                <br></br>
        <input type="checkbox" value="json" onChange={this.setDownloadType.bind(this)}
          checked={this.state.downloadType === "json"} /> JSON
                <br></br>
        <input type="checkbox" value="csv" onChange={this.setDownloadType.bind(this)}
          checked={this.state.downloadType === "csv"} /> CSV
                <br></br>
        <br></br>
        Choose Samples of Interest:
                <br></br>
        <input type="checkbox" value="first" onChange={this.setSampleSelection.bind(this)}
          checked={this.state.sampleSelection === "first"} />First visited sample
                <br></br>
        <input type="checkbox" value="current" onChange={this.setSampleSelection.bind(this)}
          checked={this.state.sampleSelection === "current"} />Current sample
                <br></br>
        <input type="checkbox" value="allSamples" onChange={this.setSampleSelection.bind(this)}
          checked={this.state.sampleSelection === "allSamples"} />All samples visited in session
                <br></br>
        {degreeDiv}
        <br></br>
        {errorDiv}
        <br></br>
        {buttonDiv}
      </div>
    )
  }
  */
};

export default DownloadSamplesPresentation;
