import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  useLayoutEffect,
} from "react";

import { Graph } from "react-d3-graph";

import { makeStyles } from "@material-ui/core/styles";

import Theme from 'portal-core-components/lib/components/Theme';
import { exists } from "portal-core-components/lib/util/typeUtil";

import { getFullSamplesApiPath } from "../../util/envUtil";
import { GRAPH_COLORS } from "../../util/appUtil";

const useStyles = makeStyles(theme => ({
  container: {
    border: `1px solid ${Theme.palette.grey[400]}`,
    backgroundColor: Theme.palette.grey[50],
    overflow: 'auto',
    resize: 'vertical',
    '& div#sample-network-graph-graph-wrapper': {
      overflow: 'hidden',
    },
  },
}));

const SampleNetwork = (props) => {
  const { onNodeClick, graphData } = props;
  const classes = useStyles(Theme);

  const [width, setWidth] = useState(1100);
  const [height, setHeight] = useState(500);
  const [containerMouseDown, setContainerMouseDown] = useState(false);
  const [containerMouseMoving, setContainerMouseMoving] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) { return; }
    const containerWidth = Math.ceil(containerRef.current.clientWidth);
    if (width !== containerWidth) {
      setWidth(containerWidth);
    }
  }, [width, setWidth, containerRef]);

  const handleVertResize = useCallback(() => {
    if (!containerRef.current) { return; }
    if (!(containerMouseDown && containerMouseMoving)) { return; }
    const containerHeight = Math.ceil(containerRef.current.clientHeight - 5);
    if (height !== containerHeight) {
      setHeight(containerHeight);
    }    
  }, [height, setHeight, containerRef, containerMouseDown, containerMouseMoving]);

  const handleMouseDown = useCallback(() => {
    setContainerMouseDown(true);
  }, [setContainerMouseDown]);

  const handleMouseUp = useCallback(() => {
    setContainerMouseDown(false);
    setContainerMouseMoving(false);
  }, [setContainerMouseDown, setContainerMouseMoving]);
  
  const handleMouseMove = useCallback(() => {
    if (!containerMouseDown) { return; }
    setContainerMouseMoving(true);
  }, [containerMouseDown, setContainerMouseMoving]);

  useLayoutEffect(() => {
    if (!containerRef.current) { return () => {}; }
    const ref = containerRef.current;
    let resizeObserver = new ResizeObserver(handleVertResize);
    resizeObserver.observe(containerRef.current);
    containerRef.current.addEventListener('mousedown', handleMouseDown);
    containerRef.current.addEventListener('mousemove', handleMouseMove);
    containerRef.current.addEventListener('mouseup', handleMouseUp);
    return () => {
      if (!ref) { return; }
      ref.removeEventListener('mousedown', handleMouseDown);
      ref.removeEventListener('mousemove', handleMouseMove);
      ref.removeEventListener('mouseup', handleMouseUp);
      if (!resizeObserver) { return; }
      resizeObserver.disconnect();
      resizeObserver = null;
    };
  });

  if (!exists(graphData) || (graphData.nodes.length <= 0)) {
    return null;
  }

  const graphConfig = {
    highlightBehavior: true,
    staticGraph: true,
    staticGraphWithDragAndDrop: true,
    panAndZoom: true,
    directed: true,
    height,
    width,
    nodeHighlightBehavior: true,
    node: {
      highlightFontSize: 12,
      highlightFontWeight: "bold",
      fontSize: 12,
      highlightStrokeColor: "#000000",
      labelProperty: "sampleName",
    },
    link: {
      color: GRAPH_COLORS.LINKS,
      highlightColor: "#000000"
    }
  };

  return (
    <div className={classes.container} ref={containerRef}>
      <Graph
        id="sample-network-graph"
        data={graphData}
        config={graphConfig}
        onClickNode={(nodeId) => {
          const url = `${getFullSamplesApiPath()}/view?sampleUuid=${nodeId}`;
          return onNodeClick(url);
        }}
      />
    </div>
  );
};

export default SampleNetwork;
