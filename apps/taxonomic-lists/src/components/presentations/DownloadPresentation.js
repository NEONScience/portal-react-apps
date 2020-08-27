import React, { Component } from "react";
import Download from "../download/Download"

class DownloadPresentation extends Component {
  render() {
    return (
      <div>
        <Download taxonTypeCode={this.props.taxonQuery.taxonTypeCode} />
      </div>
    );
  }
}

export default DownloadPresentation;
