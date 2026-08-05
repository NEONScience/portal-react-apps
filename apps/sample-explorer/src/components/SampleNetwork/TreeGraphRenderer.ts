import {
  select,
  type Selection,
} from "d3-selection";
import {
  symbol,
  symbolCircle,
  symbolSquare,
  symbolTriangle,
  symbolDiamond,
} from "d3-shape";
import {
  NODE_TYPES,
  RELATIONSHIPS
} from "./TreeGraphConstants";
import type {
  TreeNode,
  TreeConfig,
  PositionedTreeNode,
  LinkData,
  LabelRuntimeConfig,
  LinkLayoutConfig,
  LayoutRuntimeConfig,
} from "./TreeGraph.types";

type RenderTreeProps = {
  container: any;
  svgHeight: number;
  config: TreeConfig;
  firstParent: PositionedTreeNode | null;
  parentSpineX: number;
  focusNode: PositionedTreeNode;
  focusRadius: number;
  nodes: PositionedTreeNode[];
  labelConfig: LabelRuntimeConfig;
  onClickNode?: (node: TreeNode) => void;
  nodeById: Map<string, PositionedTreeNode>;
  childNodes: PositionedTreeNode[];
  links: LinkData[];
  layoutConfig: LayoutRuntimeConfig;
};

type BuildParentLinkPathProps = {
  sourceNode: PositionedTreeNode;
  parentSpineX: number;
  parentLabelToLineGap: number;
};

type BuildChildLinkPathProps = {
  sourceNode: PositionedTreeNode;
  targetNode: PositionedTreeNode;
  labelPadding: number;
};

type BuildLinkPathProps = {
  sourceNode: PositionedTreeNode;
  targetNode: PositionedTreeNode;
  parentSpineX: number;
  labelPadding: number;
  parentLabelToLineGap: number;
};

type RenderNodeSymbolsProps = {
  nodeGroups: any;
  symbolGenerator: any;
  onClickNode?: (node: TreeNode) => void;
};

type RenderNodeLabelsProps = {
  nodeGroups: any;
  labelConfig: LabelRuntimeConfig;
};

type CreateGraphLayersProps = {
  container: Selection<
    HTMLDivElement,
    unknown,
    null,
    undefined
  >;
  svgHeight: number;
  config: TreeConfig;
};

type GraphSelection = Selection<
  SVGGElement,
  unknown,
  null,
  undefined
>;

type RenderParentSpineProps = {
  linkLayer: GraphSelection;
  firstParent: PositionedTreeNode | null;
  parentSpineX: number;
  focusNode: PositionedTreeNode;
  focusRadius: number;
};

type RenderNodesProps = {
  graphLayer: GraphSelection;
  nodes: PositionedTreeNode[];
  labelConfig: LabelRuntimeConfig;
  onClickNode?: (node: TreeNode) => void;
};

type RenderLinksProps = {
  linkLayer: GraphSelection;
  links: LinkData[];
  nodeById: Map<string, PositionedTreeNode>;
  childNodes: PositionedTreeNode[];
  focusNode: PositionedTreeNode;
  linkLayoutConfig: LinkLayoutConfig;
};

const symbolMap = Object.freeze({
  [NODE_TYPES.FOCUS]: symbolCircle,
  [NODE_TYPES.PARENT]: symbolSquare,
  [NODE_TYPES.CHILD]: symbolTriangle,
  [NODE_TYPES.PREVIOUS]: symbolDiamond,
});
const DEFAULT_LINK_STROKE = "#d7d9d9";
const DEFAULT_LINK_STROKE_WIDTH = 1.5;

const buildParentLinkPath = ({
  sourceNode,
  parentSpineX,
  parentLabelToLineGap,
}: BuildParentLinkPathProps) => {
  const startX =
    (sourceNode.labelRightX ?? sourceNode.x) +
    parentLabelToLineGap;
  return `
    M${startX},${sourceNode.y}
    L${parentSpineX},${sourceNode.y}
  `;
};

const buildChildLinkPath = ({
  sourceNode,
  targetNode,
  labelPadding,
}: BuildChildLinkPathProps) => {
  const endX =
    targetNode.symbolType === NODE_TYPES.PREVIOUS
      ? targetNode.x - labelPadding
      : targetNode.x;
  return `
    M${sourceNode.x},${targetNode.y}
    L${endX},${targetNode.y}
  `;
};

const buildLinkPath = ({
  sourceNode,
  targetNode,
  parentSpineX,
  labelPadding,
  parentLabelToLineGap,
}: BuildLinkPathProps) => {
  let s = sourceNode;
  let t = targetNode;
  if (
    s.symbolType === NODE_TYPES.FOCUS &&
    (
      t.symbolType === NODE_TYPES.PARENT ||
      (
        t.symbolType === NODE_TYPES.PREVIOUS &&
        t.previousRelationship === RELATIONSHIPS.PARENT
      )
    )
  ) {
    [s, t] = [t, s];
  }
  if (
    (
      s.symbolType === NODE_TYPES.PARENT ||
      s.symbolType === NODE_TYPES.PREVIOUS
    ) &&
    t.symbolType === NODE_TYPES.FOCUS
  ) {
    return buildParentLinkPath({
      sourceNode: s,
      parentSpineX,
      parentLabelToLineGap,
    });
  }
  if (
    t.symbolType === NODE_TYPES.CHILD ||
    t.symbolType === NODE_TYPES.PREVIOUS
  ) {
    return buildChildLinkPath({
      sourceNode: s,
      targetNode: t,
      labelPadding,
    });
  }
  return null;
};

const renderNodeSymbols = ({
  nodeGroups,
  symbolGenerator,
  onClickNode,
}: RenderNodeSymbolsProps) => {
  nodeGroups
    .append("path")
    .attr("d", (d: PositionedTreeNode) => {
      const type =
        symbolMap[d.symbolType] ??
        symbolCircle;
      return symbolGenerator
        .type(type)
        .size(d.style.symbolSize)();
    })
    .attr("fill", (d: PositionedTreeNode) => d.style.fill)
    .attr("stroke", (d: PositionedTreeNode) => d.style.stroke)
    .attr("stroke-width", (d: PositionedTreeNode) => d.style.strokeWidth
    )
    .style("cursor", "pointer")
    .on("mousedown", (event: MouseEvent) => {
      event.stopPropagation();
    })
    .on("click", (event: MouseEvent, d: TreeNode) => {
      event.stopPropagation();
      if (onClickNode) {
        onClickNode(d);
      }
    });
};

const renderNodeLabels = ({
  nodeGroups,
  labelConfig,
}: RenderNodeLabelsProps) => {
  const {
    LABEL_PADDING,
    LABEL_VERTICAL_OFFSET,
    LABEL_FONT_SIZE,
    LABEL_FONT_FAMILY,
  } = labelConfig;
  const textLabels = nodeGroups
    .append("text")
    .attr("text-anchor", "start")
    .attr("x", function (
      this: SVGTextElement
    ) {
      const path = select(
        this.parentNode as SVGGElement
      )
        .select("path")
        .node() as SVGGraphicsElement;
      const bbox = path.getBBox();
      return (
        bbox.x +
        bbox.width +
        LABEL_PADDING
      );
    })

    .attr("dy", LABEL_VERTICAL_OFFSET)
    .text((d: PositionedTreeNode) => d.sampleName ?? "")
  textLabels
    .attr(
      "font-size",
      LABEL_FONT_SIZE
    )
    .attr(
      "font-family",
      LABEL_FONT_FAMILY
    );
};

const cacheLabelPositions = (nodeGroups: any) => {
  nodeGroups.each(function (
    this: SVGGElement,
    d: PositionedTreeNode
  ) {
    const textElement = select(this)
      .select("text")
      .node() as SVGGraphicsElement | null;
    if (textElement) {
      const textBounds =
        textElement.getBBox();
      // Used when drawing parent connector lines.
      d.labelRightX =
        d.x +
        textBounds.x +
        textBounds.width;
    }
  });
};


export const renderTree = ({
  container,
  svgHeight,
  config,
  firstParent,
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
    focusNode,
    focusRadius,
  });
  renderNodes({
    graphLayer,
    nodes,
    labelConfig,
    onClickNode,
  });
  const linkLayoutConfig: LinkLayoutConfig = {
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


export const getGraphContainer = (element: HTMLDivElement | null) =>
  select(element);

export const createGraphLayers = ({
  container,
  svgHeight,
  config,
}: CreateGraphLayersProps) => {
  const linkConfig = config?.link ?? {};
  const svg = container
    .append("svg")
    .attr("width", "100%")
    .attr("height", svgHeight);
  const graphLayer = svg.append("g");
  const linkLayer = graphLayer
    .append("g")
    .attr("fill", "none")
    .attr(
      "stroke",
      linkConfig.stroke ?? DEFAULT_LINK_STROKE
    )
    .attr(
      "stroke-width",
      linkConfig.strokeWidth ??
      DEFAULT_LINK_STROKE_WIDTH
    );
  return {
    graphLayer,
    linkLayer,
  };
};

export const renderParentSpine = ({
  linkLayer,
  firstParent,
  parentSpineX,
  focusNode,
  focusRadius,
}: RenderParentSpineProps) => {
  if (!firstParent) {
    return;
  }
  const spineStartY = firstParent.y;
  const spineEndY = focusNode.y - focusRadius;
  linkLayer
    .append("path")
    .attr(
      "d",
      `
        M${parentSpineX},${spineStartY}
        L${parentSpineX},${spineEndY}
      `
    );
  };

export const renderNodes = ({
  graphLayer,
  nodes,
  labelConfig,
  onClickNode,
}: RenderNodesProps) => {

  const symbolGenerator = symbol();
  const nodeGroups = graphLayer
    .append("g")
    .selectAll("g")
    .data(nodes)
    .join("g")
    .attr(
      "transform",
      (d: PositionedTreeNode) => `translate(${d.x},${d.y})`
    );
  renderNodeSymbols({
    nodeGroups,
    symbolGenerator,
    onClickNode,
  });
  renderNodeLabels({
    nodeGroups,
    labelConfig,
  });
  cacheLabelPositions(nodeGroups);
};

export const renderLinks = ({
  linkLayer,
  links,
  nodeById,
  childNodes,
  focusNode,
  linkLayoutConfig,
}: RenderLinksProps) => {

  const {
    parentSpineX,
    LABEL_PADDING,
    PARENT_LABEL_TO_LINE_GAP,
  } = linkLayoutConfig;
  const spineStartX = focusNode.x;
  const spineStartY = focusNode.y;
  const spineEndY =
    childNodes.length > 0
      ? childNodes.reduce((a, b) =>
          a.y > b.y ? a : b
        ).y
      : spineStartY;
  if (childNodes.length > 0) {
    linkLayer
      .append("path")
      .attr(
        "d",
        `
          M${spineStartX},${spineStartY}
          L${spineStartX},${spineEndY}
        `
      );
  }
  linkLayer
    .selectAll("path.link")
    .data(links)
    .join("path")
    .attr("class", "link")
    .attr("d", (d: LinkData) => {
      const sourceNode = nodeById.get(d.source);
      const targetNode = nodeById.get(d.target);
      if (!sourceNode || !targetNode) {
        return null;
      }
      return buildLinkPath({
        sourceNode,
        targetNode,
        parentSpineX,
        labelPadding: LABEL_PADDING,
        parentLabelToLineGap: PARENT_LABEL_TO_LINE_GAP,
      });
    });
};
