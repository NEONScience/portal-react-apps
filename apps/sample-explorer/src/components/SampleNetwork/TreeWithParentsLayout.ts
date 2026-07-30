import type {
  TreeNode,
  StyledTreeNode,
  NodeStyleOverrides,
  SampleView,
  GraphData,
} from "./TreeWithParents.types";
import {
  NODE_TYPES,
  PREVIOUS_RELATIONSHIPS,
  LABEL_DEFAULTS,
  SVG_DEFAULTS,
  SPACING_DEFAULTS,
  LAYOUT_DEFAULTS,
} from "./TreeWithParentsConstants";


type BuildConfigProps = {
  layout?: any;
  spacing?: any;
  labels?: any;
  svg?: any;
};

type ClassifyPreviousNodesProps = {
  previousNodes: StyledTreeNode[];
  currentSampleView?: SampleView;
};

type ClassifyPreviousNodesResult = {
  previousParentNodes: StyledTreeNode[];
  previousChildNodes: StyledTreeNode[];
};

type PrepareTreeDataProps = {
  focusNodes: StyledTreeNode[];
  previousNodes: StyledTreeNode[];
  parentNodes: StyledTreeNode[];
  childNodes: StyledTreeNode[];
  sampleViews?: SampleView[];
  labelFont: string;
};

type BuildGraphDataProps = {
  data: GraphData;
  nodeStyles?: Partial<NodeStyleOverrides>;
};

type ComputeLayoutProps = {
  parentNodes: TreeNode[];
  childNodes: TreeNode[];
  focusNode: TreeNode;
  longestParentLabelWidth: number;
  containerHeight: number;
  layoutConfig: any;
};


export const buildConfig = (
  config: BuildConfigProps
) => {
  const layout = config.layout ?? {};
  const spacing = config.spacing ?? {};
  const labels = config.labels ?? {};
  const svg = config.svg ?? {};
  const layoutScale = layout.scale ?? LAYOUT_DEFAULTS.scale;
  const labelFontSize = labels.fontSize ?? LABEL_DEFAULTS.fontSize;
  const labelFontFamily = labels.fontFamily ?? LABEL_DEFAULTS.fontFamily;
  const labelPadding =
    labels.labelPadding ??
    (
      LABEL_DEFAULTS.padding * layoutScale
    );
  return {
    labelFont:
      `${labelFontSize}px ${labelFontFamily}`,
    labelConfig: {
      LABEL_PADDING: labelPadding,
      LABEL_VERTICAL_OFFSET:
        labels.verticalOffset ??
        LABEL_DEFAULTS.verticalOffset,
      LABEL_FONT_SIZE: labelFontSize,
      LABEL_FONT_FAMILY: labelFontFamily,
    },
    layoutConfig: {
      LEFT_MARGIN: layout.leftMargin ?? LAYOUT_DEFAULTS.leftMargin,
      TOP_MARGIN: layout.topMargin ?? LAYOUT_DEFAULTS.topMargin,
      LABEL_PADDING: labelPadding,
      ROW_SPACING:
        (
          spacing.row ??
          SPACING_DEFAULTS.row
        ) * layoutScale,
      COLUMN_SPACING:
        (
          spacing.column ??
          SPACING_DEFAULTS.column
        ) * layoutScale,
      PARENT_LABEL_TO_LINE_GAP:
        labels.parentLabelLineGap ??
        (
          LABEL_DEFAULTS.parentLabelLineGap *
          layoutScale
        ),
      PARENT_CONNECTOR_LENGTH:
        (
          layout.parentConnectorLength ??
          LAYOUT_DEFAULTS.parentConnectorLength
        ) * layoutScale,
      SVG_CONTAINER_PADDING: svg.containerPadding ?? SVG_DEFAULTS.containerPadding,
      SVG_BOTTOM_PADDING:
        svg.bottomPadding ??
        (
          SVG_DEFAULTS.bottomPadding *
          layoutScale
        ),
    },
  };
};

const DEFAULT_NODE_COLORS = {
  [NODE_TYPES.FOCUS]: "#002c77",
  [NODE_TYPES.PARENT]: "#558807",
  [NODE_TYPES.PREVIOUS]: "#f0ab00",
  [NODE_TYPES.CHILD]: "#5ca6e3",
} as const;
const DEFAULT_NODE_STROKE_WIDTH = 1.5;
const DEFAULT_SYMBOL_SIZE = 200;

// Annotates previous nodes with relationship metadata.
const classifyPreviousNodes = ({
  previousNodes,
  currentSampleView,
}: ClassifyPreviousNodesProps): ClassifyPreviousNodesResult => {
const previousParentNodes: StyledTreeNode[] = [];
const previousChildNodes: StyledTreeNode[] = [];

  if (!currentSampleView) {
    return {
      previousParentNodes,
      previousChildNodes,
    };
  }
  previousNodes.forEach(previousNode => {
    const isParent =
      currentSampleView.parentSampleIdentifiers?.some(
        parent => parent.sampleUuid === previousNode.id
      );
    const isChild =
      currentSampleView.childSampleIdentifiers?.some(
        child => child.sampleUuid === previousNode.id
      );
    if (isParent) {
      previousNode.previousRelationship =
        PREVIOUS_RELATIONSHIPS.PARENT;
      previousParentNodes.push(previousNode);
    }
    if (isChild) {
      previousNode.previousRelationship =
        PREVIOUS_RELATIONSHIPS.CHILD;
      previousChildNodes.push(previousNode);
    }
  });
  return {
    previousParentNodes,
    previousChildNodes,
  };
};

export const getNodeStyle = (
  node: TreeNode,
  nodeStyles: Partial<NodeStyleOverrides> = {}
) => {
  const defaultColor = DEFAULT_NODE_COLORS[node.symbolType];
  const nodeColor = node.color;
  return {
    fill:
      nodeStyles?.[node.symbolType]?.fill ??
      nodeColor ??
      defaultColor ??
      "#ccc",
    stroke:
      nodeStyles?.[node.symbolType]?.stroke ??
      nodeColor ??
      defaultColor ??
      "#999",
    strokeWidth:
      nodeStyles?.[node.symbolType]?.strokeWidth ??
      DEFAULT_NODE_STROKE_WIDTH,
    symbolSize:
      nodeStyles?.[node.symbolType]?.symbolSize ??
      DEFAULT_SYMBOL_SIZE,
  };
};

const textMeasureCanvas = document.createElement("canvas");
const measureTextWidth = (
  text: string,
  font: string
) => {
  const context = textMeasureCanvas.getContext("2d")!;
  context.font = font;
  return context.measureText(text).width;
};

const getLongestParentLabelWidth = (
  parentNodes: TreeNode[],
  labelFont: string
) => {
  if (parentNodes.length === 0) {
    return 0;
  }
  return Math.max(
    ...parentNodes.map(node =>
      measureTextWidth(
        node.sampleName ?? "",
        labelFont
      )
    )
  );
};

const getParentBounds = (parentNodes: TreeNode[]) => {
  if (parentNodes.length === 0) {
    return {
      firstParent: null,
      lastParent: null,
    };
  }
  return {
    firstParent: parentNodes.reduce((a, b) =>
      a.y! < b.y! ? a : b
    ),
    lastParent: parentNodes.reduce((a, b) =>
      a.y! > b.y! ? a : b
    ),
  };
};

const getFocusNodeRadius = (focusNode: StyledTreeNode) => {
  return Math.sqrt(
    focusNode.style.symbolSize / Math.PI
  );
};

export const buildGraphData = ({
  data,
  nodeStyles,
}: BuildGraphDataProps) => {
  const nodes: StyledTreeNode[] = [];
  const nodeById = new Map<string, StyledTreeNode>();
  const focusNodes: StyledTreeNode[] = [];
  const previousNodes: StyledTreeNode[] = [];
  const parentNodes: StyledTreeNode[] = [];
  const childNodes: StyledTreeNode[] = [];
  // Clone incoming redux nodes and precompute styles
  data.nodes.forEach(node => {
    const styledNode: StyledTreeNode = {
      ...node,
      style: getNodeStyle(
        node,
        nodeStyles
      ),
    };
    nodes.push(styledNode);
    nodeById.set(
      styledNode.id,
      styledNode
    );
    switch (styledNode.symbolType) {
      case NODE_TYPES.FOCUS:
        focusNodes.push(styledNode);
        break;
      case NODE_TYPES.PREVIOUS:
        previousNodes.push(styledNode);
        break;
      case NODE_TYPES.PARENT:
        parentNodes.push(styledNode);
        break;
      case NODE_TYPES.CHILD:
        childNodes.push(styledNode);
        break;
      default:
        break;
    }
  });
  return {
    nodes,
    nodeById,
    focusNodes,
    previousNodes,
    parentNodes,
    childNodes,
  };
};

// Mutates parentNodes and childNodes collections by merging previous-node relationships
export const prepareTreeData = ({
  focusNodes,
  previousNodes,
  parentNodes,
  childNodes,
  sampleViews,
  labelFont,
}: PrepareTreeDataProps) => {
  const focusNode = focusNodes[0]!;
  const currentSampleView =
    sampleViews?.find(
      sample => sample.sampleUuid === focusNode.id
    );
  const {
    previousParentNodes,
    previousChildNodes,
  } = classifyPreviousNodes({
    previousNodes,
    currentSampleView,
  });
  parentNodes.unshift(
    ...previousParentNodes
  );
  childNodes.push(
    ...previousChildNodes
  );
  const longestParentLabelWidth =
    getLongestParentLabelWidth(
      parentNodes,
      labelFont
    );
  const focusRadius =
    getFocusNodeRadius(focusNode);
  return {
    focusNode,
    longestParentLabelWidth,
    focusRadius,
  };
};

// Mutates node positions in-place.
export const computeLayout = ({
  parentNodes,
  childNodes,
  focusNode,
  longestParentLabelWidth,
  containerHeight,
  layoutConfig,
}: ComputeLayoutProps) => {
  const {
    LEFT_MARGIN,
    TOP_MARGIN,
    ROW_SPACING,
    COLUMN_SPACING,
    LABEL_PADDING,
    PARENT_LABEL_TO_LINE_GAP,
    PARENT_CONNECTOR_LENGTH,
    SVG_CONTAINER_PADDING,
    SVG_BOTTOM_PADDING,
  } = layoutConfig;
  parentNodes.forEach((n, i) => {
    n.x = LEFT_MARGIN;
    n.y = TOP_MARGIN + (i * ROW_SPACING);
  });
  const {
    firstParent,
    lastParent,
  } = getParentBounds(parentNodes);
  const parentSpineBottomY = lastParent
    ? lastParent.y + ROW_SPACING
    : TOP_MARGIN + ROW_SPACING;
  focusNode.x =
    LEFT_MARGIN +
    longestParentLabelWidth +
    LABEL_PADDING +
    PARENT_LABEL_TO_LINE_GAP +
    PARENT_CONNECTOR_LENGTH;
  const parentSpineX = focusNode.x!;
  focusNode.y =
    parentNodes.length === 0
      ? TOP_MARGIN
      : parentSpineBottomY;
  childNodes.forEach((n, i) => {
    n.x = focusNode.x + COLUMN_SPACING;
    n.y =
      focusNode.y! +
      ((i + 1) * ROW_SPACING);
  });
  const maxNodeY =
    childNodes.length > 0
      ? Math.max(
          ...childNodes.map(n => n.y!)
        )
      : focusNode.y;
  const svgHeight = Math.max(
    containerHeight -
      SVG_CONTAINER_PADDING,
    maxNodeY + SVG_BOTTOM_PADDING
  );
  return {
    firstParent,
    parentSpineBottomY,
    parentSpineX,
    svgHeight,
  };
};
