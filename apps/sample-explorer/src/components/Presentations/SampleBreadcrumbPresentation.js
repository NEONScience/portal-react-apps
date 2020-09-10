import React, { Component } from "react";

class SampleBreadcrumbPresentation extends Component {

  render() {

    //  let liStyle = {
    //     //  color: "blue",
    //      textDecorationLine: "underline"
    //  }

    let endpoint = this.props.endpoint;
    let onQueryClick = this.props.onQueryClick;
    return (
      <div id="sample-breadcrumb-presentation" >
        <p>
          <b>Sample Bread Crumb:</b>
          <br></br>
        </p>
        <ul>
          {this.props.uuidBreadcrumbs.map(function (breadcrumb, i) {
            return <li key={i} onClick={() => {
              let url = endpoint + "sampleUuid=" + breadcrumb;
              return onQueryClick(url)
            }}>{breadcrumb}</li>;
          })}
        </ul>
      </div>
    )
  }
}

export default SampleBreadcrumbPresentation;
