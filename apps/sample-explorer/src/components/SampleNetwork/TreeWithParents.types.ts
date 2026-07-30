import { NODE_TYPES } from "./TreeWithParentsConstants";

export type NodeStyle = {
  fill: string;
  stroke: string;
  strokeWidth: number;
  symbolSize: number;
};

export type NodeType = typeof NODE_TYPES[keyof typeof NODE_TYPES];

export type SampleIdentifier = {sampleUuid: string;};

export type SampleView = {
  sampleUuid: string;
  parentSampleIdentifiers?: SampleIdentifier[];
  childSampleIdentifiers?: SampleIdentifier[];
};

export type TreeConfig = {
  nodeStyles?: Record<string, unknown>;
  layout?: any;
  spacing?: any;
  labels?: any;
  svg?: any;
};

export type NodeStyleOverrides = Record<
  NodeType,
  Partial<NodeStyle>
>;

export type LinkData = {
  source: string;
  target: string;
};

export type GraphData = {
  nodes: TreeNode[];
  links: LinkData[];
};

export type TreeNode = {
  id: string;
  symbolType: NodeType;
  sampleName?: string;
  color?: string;
  x?: number;
  y?: number;
  labelRightX?: number;
  previousRelationship?: string;
  style?: NodeStyle;
};


// export type TreeNode = {
//   id: string;
//   symbolType: NodeType;
//   sampleName?: string;
//   color?: string;
//   previousRelationship?: string;
// };

// export type StyledTreeNode = TreeNode & {
//   style: NodeStyle;
// };

// export type PositionedTreeNode = StyledTreeNode & {
//   x: number;
//   y: number;
// };

// export type RenderTreeNode = PositionedTreeNode & {
//   labelRightX?: number;
// };
