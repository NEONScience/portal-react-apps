import {
  NODE_TYPES,
  RELATIONSHIPS,
} from './TreeGraphConstants';

export type NodeType = typeof NODE_TYPES[keyof typeof NODE_TYPES];

export type NodeStyle = {
  fill: string;
  stroke: string;
  strokeWidth: number;
  symbolSize: number;
};

export type NodeStyleOverrides = Record<
  NodeType,
  Partial<NodeStyle>
>;

export type PreviousRelationship = typeof RELATIONSHIPS[keyof typeof RELATIONSHIPS];

export type SampleIdentifier = {
  sampleUuid: string;
};

export type SampleView = {
  sampleUuid: string;
  parentSampleIdentifiers?: SampleIdentifier[];
  childSampleIdentifiers?: SampleIdentifier[];
};

export type LayoutConfigOverrides = {
  leftMargin?: number;
  topMargin?: number;
  scale?: number;
  parentConnectorLength?: number;
};

export type SpacingConfigOverrides = {
  row?: number;
  column?: number;
};

export type LabelConfigOverrides = {
  fontSize?: number;
  fontFamily?: string;
  labelPadding?: number;
  parentLabelLineGap?: number;
  verticalOffset?: string;
};

export type SvgConfigOverrides = {
  bottomPadding?: number;
  containerPadding?: number;
};

export type LinkConfigOverrides = {
  stroke?: string;
  strokeWidth?: number;
};

export type LayoutRuntimeConfig = {
  LEFT_MARGIN: number;
  TOP_MARGIN: number;
  LABEL_PADDING: number;
  ROW_SPACING: number;
  COLUMN_SPACING: number;
  PARENT_LABEL_TO_LINE_GAP: number;
  PARENT_CONNECTOR_LENGTH: number;
  SVG_CONTAINER_PADDING: number;
  SVG_BOTTOM_PADDING: number;
};

export type LabelRuntimeConfig = {
  LABEL_PADDING: number;
  LABEL_VERTICAL_OFFSET: string;
  LABEL_FONT_SIZE: number;
  LABEL_FONT_FAMILY: string;
};

export type TreeConfig = {
  nodeStyles?: Partial<NodeStyleOverrides>;
  layout?: LayoutConfigOverrides;
  spacing?: SpacingConfigOverrides;
  labels?: LabelConfigOverrides;
  svg?: SvgConfigOverrides;
  link?: LinkConfigOverrides;
};

export type LinkData = {
  source: string;
  target: string;
};

export type GraphData = {
  nodes: TreeNode[];
  links: LinkData[];
};

export type LinkLayoutConfig = {
  parentSpineX: number;
  LABEL_PADDING: number;
  PARENT_LABEL_TO_LINE_GAP: number;
};

export type TreeNode = {
  id: string;
  symbolType: NodeType;
  sampleName?: string;
  color?: string;
  x?: number;
  y?: number;
  labelRightX?: number;
  previousRelationship?: PreviousRelationship;
  style?: NodeStyle;
};

export type StyledTreeNode = TreeNode & {
  style: NodeStyle;
};

export type PositionedTreeNode = StyledTreeNode & {
  x: number;
  y: number;
};
