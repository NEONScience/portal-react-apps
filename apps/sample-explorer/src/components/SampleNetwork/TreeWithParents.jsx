import { useLayoutEffect,
  useRef
} from "react";
import {
  buildGraphData,
  prepareTreeData,
  computeLayout,
  buildConfig,
} from "./TreeWithParentsLayout";
import {
  createGraphLayers,
  renderParentSpine,
  renderNodes,
  renderLinks,
  getGraphContainer,
} from "./TreeWithParentsRenderer";

const renderTree = ({
  container,
  svgHeight,
  config,
  firstParent,
  parentSpineBottomY,
  parentSpineX,
  focusNode,
  focusRadius,
  nodes,
  labelConfig,
  onClickNode,
  nodeById,
  childNodes,
  links,
  layoutConfig,
}) => {
  const {
    graphLayer,
    linkLayer,
  } = createGraphLayers({
    container,
    svgHeight,
    config,
  });
  renderParentSpine({
    linkLayer,
    firstParent,
    parentSpineX,
    parentSpineBottomY,
    focusNode,
    focusRadius,
  });
  renderNodes({
    graphLayer,
    nodes,
    labelConfig,
    onClickNode,
  });
  const linkLayoutConfig = {
    parentSpineX,
    LABEL_PADDING:
      labelConfig.LABEL_PADDING,
    PARENT_LABEL_TO_LINE_GAP:
      layoutConfig.PARENT_LABEL_TO_LINE_GAP,
  };
  renderLinks({
    linkLayer,
    links,
    nodeById,
    childNodes,
    focusNode,
    linkLayoutConfig,
  });
};

const TreeWithParents = ({
  data = { nodes: [], links: [] },
  visitedSamples,
  config = {},
  containerHeight = 0,
  onClickNode,
}) => {
  const ref = useRef(null);
  useLayoutEffect(() => {
    const container = getGraphContainer(ref.current);
    const {
      nodes,
      nodeById,
      focusNodes,
      previousNodes,
      parentNodes,
      childNodes,
    } = buildGraphData({
      data,
      nodeStyles: config.nodeStyles,
    });
    const {
      labelFont,
      labelConfig,
      layoutConfig,
    } = buildConfig(config);
    if (focusNodes.length !== 1) {
      console.error(
        `TreeWithParents requires exactly one focus node. Found ${focusNodes.length}.`
      );
      return () => { container.selectAll("*").remove(); };
    }
    const {
      focusNode,
      longestParentLabelWidth,
      focusRadius,
    } = prepareTreeData({
      focusNodes,
      previousNodes,
      parentNodes,
      childNodes,
      sampleViews: visitedSamples?.sampleViews,
      labelFont,
    });
    // keep the graph clean by removing any existing SVG elements before rendering a new one.
    container.selectAll("*").remove();
    const {
      firstParent,
      parentSpineBottomY,
      parentSpineX,
      svgHeight,
    } = computeLayout({
      parentNodes,
      childNodes,
      focusNode,
      longestParentLabelWidth,
      containerHeight,
      layoutConfig,
    });
    renderTree({
      container,
      svgHeight,
      config,
      firstParent,
      parentSpineBottomY,
      parentSpineX,
      focusNode,
      focusRadius,
      nodes,
      labelConfig,
      onClickNode,
      nodeById,
      childNodes,
      links: data.links,
      layoutConfig,
    });
    return () => { container.selectAll("*").remove(); };
  }, [
    data,
    config,
    onClickNode,
    containerHeight,
    visitedSamples?.sampleViews,
  ]);
  return (
    <div
      ref={ref}
      style={{
        width: "100%",
        overflow: "visible",
      }}
    />
  )
};
export default TreeWithParents;
