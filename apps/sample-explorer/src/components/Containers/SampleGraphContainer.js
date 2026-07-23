import { connect } from 'react-redux';
import SampleGraphPresentation from '../Presentations/SampleGraphPresentation';

import { querySample } from '../../util/fetchUtil';

const mapStateToProps = (state) => ({
  sampleUuid: state.sampleUuid,
  graphData: state.graphData,
  visitedSamples: state.visitedSamples,
});

const mapDispatchToProps = (dispatch) => ({
  onQueryClick: (url, cacheControl, headers) => {
    dispatch(querySample(url, cacheControl, headers));
  },
});

const SampleGraphContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(SampleGraphPresentation);

export default SampleGraphContainer;
