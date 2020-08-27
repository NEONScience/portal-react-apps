import React from "react";
import { Graph } from "react-d3-graph";
import { getFullSamplesApiPath } from "../../util/envUtil";
import { exists } from "portal-core-components/lib/util/typeUtil";

const SampleNetwork = (props) => {
  const graphConfig = {
    highlightBehavior: true,
    staticGraph: true,
    staticGraphWithDragAndDrop: true,
    panAndZoom: true,
    directed: true,
    height: 600,
    width: 1100,
    nodeHighlightBehavior: true,
    node: {
      highlightFontSize: 12,
      highlightFontWeight: "bold",
      fontSize: 12,
      highlightStrokeColor: "#000000",
      labelProperty: "sampleName",
    },
    link: {
      color: "#FFFAFA",
      highlightColor: "#000000"
    }
  };

  const nodeClick = (nodeId) => {
    let url = `${getFullSamplesApiPath()}/view?sampleUuid=${nodeId}`;
    return props.onNodeClick(url);
  };

  if (!exists(props.graphData) || (props.graphData.nodes.length <= 0)) {
    return (<React.Fragment />);
  }

  let containerStyle = {
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#E8E8E8",
    overflow: "auto",
    backgroundColor: "#ffffff"
  };
  return (
    <div style={containerStyle}>
      <Graph
        id="graph-id"
        data={props.graphData}
        config={graphConfig}
        onClickNode={nodeClick}
      />
    </div>
  );
}

export default SampleNetwork;
