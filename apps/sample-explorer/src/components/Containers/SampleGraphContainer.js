import { connect } from "react-redux";
import SampleGraphPresentation from "../Presentations/SampleGraphPresentation";

import { querySample } from "../../util/fetchUtil";

const mapStateToProps = (state) => {
  return {
    sampleUuid: state.sampleUuid,
    graphData: state.graphData,
  };
}

const mapDispatchToProps = (dispatch) => {
  return {
    onQueryClick: (url, cacheControl) => {
      dispatch(querySample(url, cacheControl));
    }
  };
}

const SampleGraphContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(SampleGraphPresentation);

export default SampleGraphContainer;
