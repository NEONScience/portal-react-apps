import * as d3 from "d3";
import {
  NODE_TYPES,
  PREVIOUS_RELATIONSHIPS
} from "./TreeWithParentsConstants";

const symbolMap = Object.freeze({
  [NODE_TYPES.FOCUS]: d3.symbolCircle,
  [NODE_TYPES.PARENT]: d3.symbolSquare,
  [NODE_TYPES.CHILD]: d3.symbolTriangle,
  [NODE_TYPES.PREVIOUS]: d3.symbolDiamond,
});
const DEFAULT_LINK_STROKE = "#d7d9d9";
const DEFAULT_LINK_STROKE_WIDTH = 1.5;

const buildParentLinkPath = ({
  sourceNode,
  parentSpineX,
  parentLabelToLineGap,
}) => {
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
}) => {
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
}) => {
  let s = sourceNode;
  let t = targetNode;
  if (
    s.symbolType === NODE_TYPES.FOCUS &&
    (
      t.symbolType === NODE_TYPES.PARENT ||
      (
        t.symbolType === NODE_TYPES.PREVIOUS &&
        t.previousRelationship === PREVIOUS_RELATIONSHIPS.PARENT
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
}) => {
  nodeGroups
    .append("path")
    .attr("d", d => {
      const type =
        symbolMap[d.symbolType] ??
        d3.symbolCircle;
      return symbolGenerator
        .type(type)
        .size(d.style.symbolSize)();
    })
    .attr("fill", d => d.style.fill)
    .attr("stroke", d => d.style.stroke)
    .attr(
      "stroke-width",
      d => d.style.strokeWidth
    )
    .style("cursor", "pointer")
    .on("mousedown", event => {
      event.stopPropagation();
    })
    .on("click", (event, d) => {
      event.stopPropagation();
      if (onClickNode) {
        onClickNode(d);
      }
    });
};

const renderNodeLabels = ({
  nodeGroups,
  labelConfig,
}) => {
  const {
    LABEL_PADDING,
    LABEL_VERTICAL_OFFSET,
    LABEL_FONT_SIZE,
    LABEL_FONT_FAMILY,
  } = labelConfig;
  const textLabels = nodeGroups
    .append("text")
    .attr("text-anchor", "start")
    .attr("x", function () {
      const bbox = d3
        .select(this.parentNode)
        .select("path")
        .node()
        .getBBox();
      return (
        bbox.x +
        bbox.width +
        LABEL_PADDING
      );
    })
    .attr("dy", LABEL_VERTICAL_OFFSET)
    .text(d => d.sampleName);
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

const cacheLabelPositions = nodeGroups => {
  nodeGroups.each(function (d) {
    const textElement = d3
      .select(this)
      .select("text")
      .node();
    if (textElement) {
      const textBounds =
        textElement.getBBox();
      // Used for parent link positioning.
      d.labelRightX =
        d.x +
        textBounds.x +
        textBounds.width;
    }
  });
};

export const getGraphContainer = element =>
  d3.select(element);

export const createGraphLayers = ({
  container,
  svgHeight,
  config,
}) => {
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
  parentSpineBottomY,
  focusNode,
  focusRadius,
}) => {
  if (!firstParent) {
    return;
  }
  linkLayer
    .append("path")
    .attr(
      "d",
      `
        M${parentSpineX},${firstParent.y}
        L${parentSpineX},${parentSpineBottomY}
      `
    );
  linkLayer
    .append("path")
    .attr(
      "d",
      `
        M${parentSpineX},${parentSpineBottomY}
        L${parentSpineX},${focusNode.y - focusRadius}
      `
    );
};

export const renderNodes = ({
  graphLayer,
  nodes,
  labelConfig,
  onClickNode,
}) => {
  const symbolGenerator = d3.symbol();
  const nodeGroups = graphLayer
    .append("g")
    .selectAll("g")
    .data(nodes)
    .join("g")
    .attr(
      "transform",
      d => `translate(${d.x},${d.y})`
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
}) => {
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
    .attr("d", d => {
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
        parentLabelToLineGap:
          PARENT_LABEL_TO_LINE_GAP,
      });
    });
};
