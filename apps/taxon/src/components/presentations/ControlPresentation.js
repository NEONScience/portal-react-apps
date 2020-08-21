import React, { Component } from "react";
import FilterContainer from "../containers/FilterContainer";
import DownloadContainer from "../containers/DownloadContainer";

class ControlPresentation extends Component {
  render() {
    let controlStyle = {
      display: "inline-block",
    }
    let downloadControlStyle = {
      display: "inline-block",
      verticalAlign: "bottom",
      marginLeft: 10,
      marginBottom: 11,
    }

    return (
      <div style={{ marginBottom: "20px" }}>
        <div style={controlStyle}>
          <FilterContainer />
        </div>
        <div style={downloadControlStyle}>
          <DownloadContainer />
        </div>
      </div>
    );
  }
}

export default ControlPresentation;
