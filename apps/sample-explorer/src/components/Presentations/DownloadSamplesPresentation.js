import React, { Component } from "react";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import {
  getFullSamplesApiPath
} from "../../util/envUtil";

class DownloadSamplesPresentation extends Component {

  constructor(props) {
    super(props);
    this.state = {
      downloadType: "json",
      sampleSelection: "",
      degreeType: "chosen",
      degree: "",
    };
  }

  setDownloadType(e) {
    const value = e.target.value;
    this.setState({
      downloadType: value,
    });
    this.props.onPopupResetClick();
  }

  setSampleSelection(e) {
    const value = e.target.value;
    this.setState({
      sampleSelection: value,
    })
    this.props.onPopupResetClick();
  }

  setDegreeType(e) {
    const value = e.target.value;
    this.setState({
      degreeType: value,
      degree: "",
    })
    this.props.onPopupResetClick();
  }

  setDegree(e) {
    const value = e.target.value;
    this.setState({
      degree: value,
    })
    this.props.onPopupResetClick();
  }

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
}

export default DownloadSamplesPresentation;
