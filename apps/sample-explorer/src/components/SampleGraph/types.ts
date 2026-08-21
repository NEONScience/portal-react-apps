import {
  NODE_TYPES,
  RELATIONSHIPS,
} from './SampleGraphConstants';

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
  leftMargin: number;
  topMargin: number;
  labelPadding: number;
  rowSpacing: number;
  columnSpacing: number;
  parentLabelToLineGap: number;
  parentConnectorLength: number;
  svgContainerPadding: number;
  svgBottomPadding: number;
};

export type LabelRuntimeConfig = {
  labelPadding: number;
  labelVerticalOffset: string;
  labelFontSize: number;
  labelFontFamily: string;
};

export type GraphConfig = {
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
  nodes: GraphNode[];
  links: LinkData[];
};

export type LinkLayoutConfig = {
  parentSpineX: number;
  labelPadding: number;
  parentLabelToLineGap: number;
};

export type GraphNode = {
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

export type StyledGraphNode = GraphNode & {
  style: NodeStyle;
};

export type PositionedGraphNode = StyledGraphNode & {
  x: number;
  y: number;
};
