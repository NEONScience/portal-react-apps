import React, { useState } from "react";

import Grid from "@material-ui/core/Grid";
import Modal from "@material-ui/core/Modal";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";

import DownloadIcon from '@material-ui/icons/SaveAlt';

import Theme from 'portal-core-components/lib/components/Theme';

import SampleInfoPresentation from "./SampleInfoPresentation";
import DownloadSamplesPresentation from "./DownloadSamplesPresentation";
import DataGrid from "../DataGrid/DataGrid";

import { smsFields } from "../../util/appUtil";

import "font-awesome/css/font-awesome.min.css";

const fileDownload = require("js-file-download");
const { Parser } = require("json2csv");

const useStyles = makeStyles(theme => ({
  paper: {
    position: "absolute",
    width: 400,
    backgroundColor: theme.palette.background.paper,
    borderRadius: "4px",
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 4),
  },
}));

const SampleEventPresentation = (props) => {
  const { onPopupResetClick } = props;
  const classes = useStyles(Theme);
  const [displayPopup, setDisplayPopup] = useState(false);

  const launchDownloadPopup = () => {
    setDisplayPopup(true);
  };
  const closeDownloadPopup = () => {
    setDisplayPopup(false);
    return onPopupResetClick();
  };
  const downloadPossibleSMSFields = () => {
    let headers = ["SMS Field Name", "Description"];
    let csvData = [];
    for (let [key, value] of smsFields) {
      let row = [];
      row = Object.assign(row, { "SMS Field Name": key });
      row = Object.assign(row, { "Description": value });
      csvData.push(row);
    }

    let jsonParser = new Parser({ fields: headers });
    let csvResult = jsonParser.parse(csvData);
    fileDownload(csvResult, "smsFieldNames.csv");
  };

  let modalDownloadStyle = {
    width: 495,
    margin: "0px auto",
    position: "relative",
    marginTop: "40px"
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
      <div style={{ marginTop: Theme.spacing(3) }}>
        <div style={{ marginBottom: Theme.spacing(3) }}>
          <SampleInfoPresentation  {...props} />
        </div>
        <div style={{ marginBottom: Theme.spacing(3) }}>
          <DataGrid {...props} />
        </div>
        <div className="event-download" style={{ marginBottom: Theme.spacing(3) }}>
          <Grid container spacing={1}>
            <Grid item xs={12} sm={5} style={{ maxWidth: "320px" }}>
              <Button
                style={{ marginRight: Theme.spacing(3), whiteSpace: 'nowrap' }}
                variant="outlined"
                color="primary"
                onClick={downloadPossibleSMSFields}
              >
                Download Possible SMS Fields List
                <DownloadIcon fontSize="small" style={{ marginLeft: Theme.spacing(1) }} />
              </Button>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Button variant="contained" color="primary" onClick={launchDownloadPopup}>
                Download Sample(s)
                <DownloadIcon fontSize="small" style={{ marginLeft: Theme.spacing(1) }} />
              </Button>
            </Grid>
          </Grid>
        </div>
        <Modal
          open={displayPopup}
          onClose={closeDownloadPopup}
        >
          <div style={modalDownloadStyle} className={classes.paper}>
            <DownloadSamplesPresentation {...props} />
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default SampleEventPresentation;
