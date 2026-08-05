//Node Rendering Constants
export const NODE_TYPES = {
  FOCUS: "circle",
  PARENT: "square",
  PREVIOUS: "diamond",
  CHILD: "triangle",
} as const;

//Relationship Constants
export const RELATIONSHIPS = {
  PARENT: "parent",
  CHILD: "child",
} as const;

//Layout Default Constants
export const LAYOUT_DEFAULTS = {
  leftMargin: 25,
  topMargin: 25,
  scale: 1,
  parentConnectorLength: 50,
} as const;

export const SPACING_DEFAULTS = {
  row: 30,
  column: 80,
} as const;

export const LABEL_DEFAULTS = {
  padding: 8,
  fontSize: 13,
  fontFamily:
    "Inter, Helvetica, Arial, sans-serif",
  parentLabelLineGap: 5,
  verticalOffset: "0.32em",
} as const;

export const SVG_DEFAULTS = {
  bottomPadding: 100,
  containerPadding: 15,
} as const;
