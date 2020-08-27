import React from "react";
import Grid from "@material-ui/core/Grid";
import Modal from "@material-ui/core/Modal";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import { makeStyles, createStyles } from "@material-ui/core/styles";
import SampleInfoPresentation from "./SampleInfoPresentation";
import DataGrid from "../DataGrid/DataGrid";
import DownloadSamplesPresentation from "./DownloadSamplesPresentation";
import smsFields from "./smsFieldNames";

import "font-awesome/css/font-awesome.min.css";
import "./SampleEventPresentation.css";

const fileDownload = require("js-file-download");
const { Parser } = require("json2csv");

const useStyles = makeStyles((theme) =>
  createStyles({
    paper: {
      position: "absolute",
      width: 400,
      backgroundColor: theme.palette.background.paper,
      borderRadius: "4px",
      boxShadow: theme.shadows[5],
      padding: theme.spacing(2, 4, 4),
    },
  })
);

const SampleEventPresentation = (props) => {
  const classes = useStyles();
  const [displayPopup, setDisplayPopup] = React.useState(false);

  const launchDownloadPopup = () => {
    setDisplayPopup(true);
  };
  const closeDownloadPopup = () => {
    setDisplayPopup(false);
    return props.onPopupResetClick();
  };
  const downloadPossibleSMSFields = () => {
    let headers = ["SMS Field Name", "Description"]
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

  let downloadButtonStyle = {
    paddingTop: 30,
    paddingLeft: 0,
  };
  let modalDownloadStyle = {
    width: 495,
    margin: "0px auto",
    position: "relative",
    marginTop: "40px"
  };
  return (
    <div key={props.sampleUuid}>
      <div className="event-container">
        <div className="event-desc">
          <Typography variant="h5">
            Sample Events
          </Typography>
          <Typography variant="subtitle1">
            History of Sample Custody Events along with all Sample Management
            System (SMS) fields (taxon excepted) available for the focal sample tag.
          </Typography>
        </div>
      </div>
      <div>
        <div style={{ marginTop: "20px", marginBottom: "20px" }}>
          <SampleInfoPresentation  {...props} />
        </div>
        <div id="events">
          <DataGrid {...props} />
        </div>
        <div className="event-download" style={downloadButtonStyle}>
          <Grid container spacing={1}>
            <Grid item xs={12} sm={5} style={{ maxWidth: "320px" }}>
              <Button
                style={{ marginRight: "20px"}}
                variant="outlined"
                color="primary"
                onClick={() => {
                  downloadPossibleSMSFields();
                }}
              >
                Download list of possible SMS Fields
              </Button>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Button variant="contained" color="primary"
                onClick={() => {
                  launchDownloadPopup();
                }}
              >
                Download Sample(s)
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
}

export default SampleEventPresentation;
