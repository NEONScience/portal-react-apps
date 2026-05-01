import React, { Component } from "react";
import PropTypes from 'prop-types';

class VisitedSamplesPresentation extends Component {
  constructor(props) {
    super(props);

    const { onRemoveSampleClick } = this.props;
    this.onRemoveSampleClick = onRemoveSampleClick;
    this.createSampleList = this.createSampleList.bind(this);
  }

  createSampleList(sampleView) {
    return (
      // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
      <li
        onClick={() => this.onRemoveSampleClick(sampleView.sampleUuid)}
        onKeyDown={() => this.onRemoveSampleClick(sampleView.sampleUuid)}
        key={sampleView.sampleUuid}
      >
        {`${sampleView.sampleClass}/${sampleView.sampleTag}`}
      </li>
    );
  }

  render() {
    const { visitedSamples } = this.props;
    const samples = visitedSamples.downloads;
    let sampleList = [];
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

VisitedSamplesPresentation.propTypes = {
  visitedSamples: PropTypes.shape({
    downloads: PropTypes.arrayOf(
      PropTypes.shape({
        sampleUuid: PropTypes.string.isRequired,
        sampleClass: PropTypes.string.isRequired,
        sampleTag: PropTypes.string.isRequired,
      }),
    ).isRequired,
  }).isRequired,
  onRemoveSampleClick: PropTypes.func.isRequired,
};

export default VisitedSamplesPresentation;
