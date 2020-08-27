import React, { Component } from "react";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import { exists } from "portal-core-components/lib/util/typeUtil";
import { getFullSamplesApiPath } from "../../util/envUtil";

import "./Query.css";

class QueryBySampleTag extends Component {
  componentDidMount() {
    if ((this.props.query.sampleTag !== null) && (this.props.query.sampleClasses.length === 0)) {
      let url = getFullSamplesApiPath();
      let classUrl = url + "/classes?sampleTag=" + encodeURIComponent(this.props.query.sampleTag);
      this.props.onQuerySampleTagClasses(classUrl);
    }
  }
  render() {
    let inputStyle = {
      outlineWidth: 0,
      borderWidth: 1,
      height: 38,
      width: "100%",
      marginRight: "10px",
      marginTop: "0px",
      marginBottom: "0px"
    };
    return (
      <div id="sample-query-by-tag"  >
        <Typography variant="body1">
          Enter Sample Tag
        </Typography>
        <div>
          <TextField
            style={inputStyle}
            autoComplete="on"
            value={!exists(this.props.query.sampleTag) ? "" : this.props.query.sampleTag}
            margin="normal"
            variant="outlined"
            onChange={(e) => this.props.onSetQuerySampleTag(e.currentTarget.value)}
          />
        </div>
      </div>
    )
  }
}

export default QueryBySampleTag;
