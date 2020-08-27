import React, { Component } from "react";


class VisitedSamplesPresentation extends Component {

  constructor(props) {
    super(props);

    this.state = {
      samples: this.props.visitedSamples.downloads,
    };

    this.createSampleList = this.createSampleList.bind(this);
  }

  createSampleList(sampleView) {
    return <li onClick={() => this.props.onRemoveSampleClick(sampleView.sampleUuid)}
      key={sampleView.sampleUuid}>{sampleView.sampleClass + "/" + sampleView.sampleTag}</li>
  }

  render() {
    var samples = this.props.visitedSamples.downloads
    var sampleList = [];
    if (samples.length !== 0) {
      sampleList = samples.map(this.createSampleList);
    }

    return (
      <div id="visited-samples-presentation">
        <p>
          Visited Samples: Click to remove sample from download:
                </p>
        <ul className="sampleList">
          {sampleList}
        </ul>

      </div>
    );
  }
}

export default VisitedSamplesPresentation;
