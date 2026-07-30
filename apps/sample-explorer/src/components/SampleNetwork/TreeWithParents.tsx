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
import type {
  TreeNode,
  SampleView,
  TreeConfig,
  GraphData,
  LinkData,
} from "./TreeWithParents.types";

type TreeWithParentsProps = {
  data?: GraphData;
  visitedSamples?: {
    sampleViews?: SampleView[];
  };
  config?: TreeConfig;
  containerHeight?: number;
  onClickNode?: (node: TreeNode) => void;
};

type RenderTreeProps = {
  container: any;
  svgHeight: number;
  config: any;
  firstParent: TreeNode | null;
  parentSpineBottomY: number;
  parentSpineX: number;
  focusNode: TreeNode;
  focusRadius: number;
  nodes: TreeNode[];
  labelConfig: any;
  onClickNode?: (node: TreeNode) => void;
  nodeById: Map<string, TreeNode>;
  childNodes: TreeNode[];
  links: LinkData[];
  layoutConfig: any;
};




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
}: RenderTreeProps) => {
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
}: TreeWithParentsProps) => {
  const ref = useRef<HTMLDivElement | null>(null);
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
