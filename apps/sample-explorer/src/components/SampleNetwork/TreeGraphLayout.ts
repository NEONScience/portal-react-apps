import type {
  TreeNode,
  StyledTreeNode,
  PositionedTreeNode,
  NodeStyleOverrides,
  SampleView,
  GraphData,
  TreeConfig,
  LayoutRuntimeConfig,
  LabelRuntimeConfig,
} from './TreeGraph.types';
import {
  NODE_TYPES,
  RELATIONSHIPS,
  LABEL_DEFAULTS,
  SVG_DEFAULTS,
  SPACING_DEFAULTS,
  LAYOUT_DEFAULTS,
} from './TreeGraphConstants';

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

type PrepareTreeDataResult = {
  focusNode: StyledTreeNode;
  longestParentLabelWidth: number;
  focusRadius: number;
};

type BuildGraphDataProps = {
  data: GraphData;
  nodeStyles?: Partial<NodeStyleOverrides>;
};

type ComputeLayoutProps = {
  parentNodes: StyledTreeNode[];
  childNodes: StyledTreeNode[];
  focusNode: StyledTreeNode;
  longestParentLabelWidth: number;
  containerHeight: number;
  layoutConfig: LayoutRuntimeConfig;
};

type ComputeLayoutResult = {
  positionedNodes: PositionedTreeNode[];
  positionedNodeById: Map<string, PositionedTreeNode>;
  positionedParentNodes: PositionedTreeNode[];
  positionedChildNodes: PositionedTreeNode[];
  positionedFocusNode: PositionedTreeNode;
  firstParent: PositionedTreeNode | null;
  parentSpineX: number;
  svgHeight: number;
};

type BuildConfigResult = {
  labelFont: string;
  labelConfig: LabelRuntimeConfig;
  layoutConfig: LayoutRuntimeConfig;
};

export const buildConfig = (
  config: TreeConfig,
): BuildConfigResult => {
  const layout = config.layout ?? {};
  const spacing = config.spacing ?? {};
  const labels = config.labels ?? {};
  const svg = config.svg ?? {};
  const layoutScale = layout.scale ?? LAYOUT_DEFAULTS.scale;
  const labelFontSize = labels.fontSize ?? LABEL_DEFAULTS.fontSize;
  const labelFontFamily = labels.fontFamily ?? LABEL_DEFAULTS.fontFamily;
  const labelPadding = labels.labelPadding ?? (LABEL_DEFAULTS.padding * layoutScale);
  return {
    labelFont:
      `${labelFontSize}px ${labelFontFamily}`,
    labelConfig: {
      LABEL_PADDING: labelPadding,
      LABEL_VERTICAL_OFFSET: labels.verticalOffset ?? LABEL_DEFAULTS.verticalOffset,
      LABEL_FONT_SIZE: labelFontSize,
      LABEL_FONT_FAMILY: labelFontFamily,
    },
    layoutConfig: {
      LEFT_MARGIN: layout.leftMargin ?? LAYOUT_DEFAULTS.leftMargin,
      TOP_MARGIN: layout.topMargin ?? LAYOUT_DEFAULTS.topMargin,
      LABEL_PADDING: labelPadding,
      ROW_SPACING: (spacing.row ?? SPACING_DEFAULTS.row) * layoutScale,
      COLUMN_SPACING: (spacing.column ?? SPACING_DEFAULTS.column) * layoutScale,
      PARENT_LABEL_TO_LINE_GAP: labels.parentLabelLineGap ?? (LABEL_DEFAULTS.parentLabelLineGap * layoutScale),
      PARENT_CONNECTOR_LENGTH: (layout.parentConnectorLength ?? LAYOUT_DEFAULTS.parentConnectorLength) * layoutScale,
      SVG_CONTAINER_PADDING: svg.containerPadding ?? SVG_DEFAULTS.containerPadding,
      SVG_BOTTOM_PADDING: svg.bottomPadding ?? (SVG_DEFAULTS.bottomPadding * layoutScale),
    },
  };
};

const DEFAULT_NODE_COLORS = {
  [NODE_TYPES.FOCUS]: '#002c77',
  [NODE_TYPES.PARENT]: '#558807',
  [NODE_TYPES.PREVIOUS]: '#f0ab00',
  [NODE_TYPES.CHILD]: '#5ca6e3',
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
  previousNodes.forEach((previousNode) => {
    const isParent = currentSampleView.parentSampleIdentifiers?.some(
      (parent) => parent.sampleUuid === previousNode.id,
    );
    const isChild = currentSampleView.childSampleIdentifiers?.some(
      (child) => child.sampleUuid === previousNode.id,
    );
    if (isParent) {
      previousParentNodes.push({
        ...previousNode,
        previousRelationship: RELATIONSHIPS.PARENT,
      });
    }
    if (isChild) {
      previousChildNodes.push({
        ...previousNode,
        previousRelationship: RELATIONSHIPS.CHILD,
      });
    }
  });
  return {
    previousParentNodes,
    previousChildNodes,
  };
};

export const getNodeStyle = (
  node: TreeNode,
  nodeStyles: Partial<NodeStyleOverrides> = {},
) => {
  const defaultColor = DEFAULT_NODE_COLORS[node.symbolType];
  const nodeColor = node.color;
  return {
    fill:
      nodeStyles?.[node.symbolType]?.fill
      ?? nodeColor
      ?? defaultColor
      ?? '#ccc',
    stroke:
      nodeStyles?.[node.symbolType]?.stroke
      ?? nodeColor
      ?? defaultColor
      ?? '#999',
    strokeWidth: nodeStyles?.[node.symbolType]?.strokeWidth ?? DEFAULT_NODE_STROKE_WIDTH,
    symbolSize: nodeStyles?.[node.symbolType]?.symbolSize ?? DEFAULT_SYMBOL_SIZE,
  };
};

const textMeasureCanvas = document.createElement('canvas');
const measureTextWidth = (
  text: string,
  font: string,
) => {
  const context = textMeasureCanvas.getContext('2d')!;
  context.font = font;
  return context.measureText(text).width;
};

const getLongestParentLabelWidth = (
  parentNodes: TreeNode[],
  labelFont: string,
) => {
  if (parentNodes.length === 0) {
    return 0;
  }
  return Math.max(
    ...parentNodes.map((node) => measureTextWidth(
      node.sampleName ?? '',
      labelFont,
    )),
  );
};

const getFocusNodeRadius = (focusNode: StyledTreeNode) => Math.sqrt(
  focusNode.style.symbolSize / Math.PI,
);
// const getFocusNodeRadius = (focusNode: StyledTreeNode) => {
//   return Math.sqrt(focusNode.style.symbolSize / Math.PI);
// };

export const buildGraphData = ({
  data,
  nodeStyles,
}: BuildGraphDataProps) => {
  const focusNodes: StyledTreeNode[] = [];
  const previousNodes: StyledTreeNode[] = [];
  const parentNodes: StyledTreeNode[] = [];
  const childNodes: StyledTreeNode[] = [];
  // Clone incoming redux nodes and precompute styles
  data.nodes.forEach((node) => {
    const styledNode: StyledTreeNode = {
      ...node,
      style: getNodeStyle(
        node,
        nodeStyles,
      ),
    };
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
}: PrepareTreeDataProps): PrepareTreeDataResult => {
  const focusNode = focusNodes[0]!;
  const currentSampleView = sampleViews?.find(
    (sample) => sample.sampleUuid === focusNode.id,
  );
  const {
    previousParentNodes,
    previousChildNodes,
  } = classifyPreviousNodes({
    previousNodes,
    currentSampleView,
  });
  parentNodes.unshift(
    ...previousParentNodes,
  );
  childNodes.push(
    ...previousChildNodes,
  );
  const longestParentLabelWidth = getLongestParentLabelWidth(
    parentNodes,
    labelFont,
  );
  const focusRadius = getFocusNodeRadius(focusNode);
  return {
    focusNode,
    longestParentLabelWidth,
    focusRadius,
  };
};

// Computes layout coordinates.
export const computeLayout = ({
  parentNodes,
  childNodes,
  focusNode,
  longestParentLabelWidth,
  containerHeight,
  layoutConfig,
}: ComputeLayoutProps): ComputeLayoutResult => {
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

  const positionedParentNodes: PositionedTreeNode[] = parentNodes.map((n, i) => ({
    ...n,
    x: LEFT_MARGIN,
    y: TOP_MARGIN + (i * ROW_SPACING),
  }));

  const firstParent = positionedParentNodes.length > 0
    ? positionedParentNodes[0]
    : null;

  const positionedFocusNode: PositionedTreeNode = {
    ...focusNode,
    x:
      LEFT_MARGIN + longestParentLabelWidth + LABEL_PADDING + PARENT_LABEL_TO_LINE_GAP + PARENT_CONNECTOR_LENGTH,
    y:
    positionedParentNodes.length === 0
      ? TOP_MARGIN
      : positionedParentNodes[positionedParentNodes.length - 1].y + ROW_SPACING,
  };

  const parentSpineX = positionedFocusNode.x;

  const positionedChildNodes: PositionedTreeNode[] = childNodes.map((n, i) => ({
    ...n,
    x:
      positionedFocusNode.x + COLUMN_SPACING,
    y:
      positionedFocusNode.y + ((i + 1) * ROW_SPACING),
  }));

  const positionedNodes: PositionedTreeNode[] = [
    ...positionedParentNodes,
    positionedFocusNode,
    ...positionedChildNodes,
  ];

  const positionedNodeById: Map<string, PositionedTreeNode> = new Map<string, PositionedTreeNode>();

  positionedNodes.forEach((node) => {
    positionedNodeById.set(
      node.id,
      node,
    );
  });

  const maxNodeY = positionedChildNodes.length > 0
    ? Math.max(
      ...positionedChildNodes.map((n) => n.y),
    ) : positionedFocusNode.y;

  const svgHeight = Math.max(
    containerHeight - SVG_CONTAINER_PADDING,
    maxNodeY + SVG_BOTTOM_PADDING,
  );

  return {
    positionedNodes,
    positionedNodeById,
    positionedParentNodes,
    positionedChildNodes,
    positionedFocusNode,
    firstParent,
    parentSpineX,
    svgHeight,
  };
};
