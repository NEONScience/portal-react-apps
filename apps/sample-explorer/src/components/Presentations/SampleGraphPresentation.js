import React, { Component } from "react";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import SampleNetwork from "../SampleNetwork/SampleNetwork"

class SampleGraphPresentation extends Component {
  constructor(props) {
    super(props);
    this.state = {
      displayPopup: false,
    }
    this.followBreadCrumb = this.followBreadCrumb.bind(this)
  }

  followBreadCrumb(nodes) {
    for (var prop in nodes) {
      return false;
    }
    return true;
  }

  render() {
    return (
      <div id="sample-graph-presentation"
        key={this.props.sampleUuid}
      >
        <Typography variant="h5">
          Sample Graph
        </Typography>
        <Typography variant="subtitle1">
          Network graph displaying sample relationships. Navigate the sample network by clicking the nodes.
        </Typography>
        <Grid container spacing={1} style={{ marginTop: "10px", marginBottom: "10px"}}>
          <Grid item xs={12} sm={6} md={3}>
            <div style={{ display: "inline-block" }}>
              <Typography variant="body2" style={{ display: "inline-block", marginRight: "5px" }}>
                Parent Sample
              </Typography>
              <svg height="20" width="20" style={{ verticalAlign: "top" }}>
                <rect width="20" height="20" style={{ fill: "#0093D1" }} />
              </svg>
            </div>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <div style={{ display: "inline-block" }}>
              <Typography variant="body2" style={{ display: "inline-block", marginRight: "5px" }}>
                Focus Sample
              </Typography>
              <svg height="20" width="20" style={{ verticalAlign: "top" }}>
                <circle cx="10" cy="10" r="10" style={{ fill: "#004C70" }}/>
              </svg>
            </div>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <div style={{ display: "inline-block" }}>
              <Typography variant="body2" style={{ display: "inline-block", marginRight: "5px" }}>
                Child Sample
              </Typography>
              <svg height="20" width="20" style={{ verticalAlign: "top" }}>
                <polygon points="10,0 20,20 0,20" style={{ fill: "#006495" }} />
              </svg>
            </div>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <div style={{ display: "inline-block" }}>
              <Typography variant="body2" style={{ display: "inline-block", marginRight: "5px" }}>
                Previous Sample
              </Typography>
              <svg height="20" width="20" style={{ verticalAlign: "top" }}>
                <polygon points="10,0 17,10 10,20 3,10 " style={{ fill: "#f3a93b" }} />
              </svg>
            </div>
          </Grid>
        </Grid>
        <SampleNetwork
          onNodeClick={this.props.onQueryClick}
          graphData={this.props.graphData}
        />
      </div>
    )
  }
}

export default SampleGraphPresentation;
