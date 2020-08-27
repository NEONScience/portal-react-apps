import React, { Component } from "react";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import Divider from "@material-ui/core/Divider";
import Typography from "@material-ui/core/Typography";
import Link from "@material-ui/core/Link";
import SampleQueryPresentation from "./SampleQueryPresentation";
import SampleEventPresentation from "./SampleEventPresentation";
import SampleGraphContainer from "../Containers/SampleGraphContainer";
import InfoPresentation from "./InfoPresentation";
import NeonPage from "portal-core-components/lib/components/NeonPage";
import { getFullSamplesApiPath } from "../../util/envUtil";

class TopPresentation extends Component {
  constructor(props) {
    super(props);
    this.downloadSupportedSampleClasses = this.downloadSupportedSampleClasses.bind(this);
  }

  downloadSupportedSampleClasses() {
    if (this.props.sampleClassDesc.size === 0) {
      let url = getFullSamplesApiPath() + "/supportedClasses"
      this.props.onDownloadSupportedClassesClick(url, true, true)
    } else {
      this.props.onDownloadSupportedClassesClick(null, false, true)
    }
  }

  render() {
    let containerStyle = {
      marginTop: "10px"
    };
    let hideStyle = {
      display: "none",
    };
    let showStyle = {
      display: "block",
    };
    let errorMessageStyle = {
      marginTop: "20px"
    };
    let downloadLink = {
      fontSize: "1rem",
      verticalAlign: "inherit"
    };

    let hidden = showStyle;
    if (this.props.query.queryErrorStr !== "success") {
      hidden = hideStyle;
    }

    let errorText;
    if (this.props.query.queryErrorStr !== null && this.props.query.queryErrorStr !== "success") {
      if (this.props.query.queryErrorStr === "Currently this Sample Class is not supported...") {
        errorText = (
          <div id="sample-info-presentation" style={errorMessageStyle}>
            <Divider />
            <div style={errorMessageStyle}>
              <Typography variant="h6">
                Currently this Sample Class is not supported.
                A list of supported sample classes is available for&nbsp;
                <Link
                  component="button"
                  variant="h6"
                  underline="always"
                  style={downloadLink}
                  onClick={() => {
                    this.downloadSupportedSampleClasses();
                  }}
                >
                  Download
                </Link>
              </Typography>
            </div>
          </div>
        );
      } else {
        errorText = (
          <div id="sample-info-presentation" style={errorMessageStyle}>
            <Divider />
            <div style={errorMessageStyle}>
              <Typography variant="h6">
                {this.props.query.queryErrorStr}
              </Typography>
            </div>
          </div>
        );
      }
    } else {
      errorText = (<React.Fragment />);
    }

    const breadcrumbs = [
      { name: "Sample Explorer" },
    ];
    return (
      <NeonPage
        title="Sample Explorer"
        breadcrumbs={breadcrumbs}
        useCoreHeader
      >
        <div className="samples-container" style={containerStyle}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <div className="text">
                <InfoPresentation {...this.props} />
              </div>
            </Grid>
            <Grid item xs={12}>
              <div className="query">
                <SampleQueryPresentation {...this.props} />
                {errorText}
              </div>
            </Grid>
            <Grid item xs={12}>
              <div className="events" style={hidden}>
                <Paper style={{ padding: "20px" }}>
                  <SampleEventPresentation {...this.props} />
                </Paper>
              </div>
            </Grid>
            <Grid item xs={12}>
              <div className="graph" style={hidden}>
                <Paper style={{ padding: "20px" }}>
                  <SampleGraphContainer />
                </Paper>
              </div>
            </Grid>
          </Grid>
        </div>
      </NeonPage>
    );
  };
}

export default TopPresentation;
