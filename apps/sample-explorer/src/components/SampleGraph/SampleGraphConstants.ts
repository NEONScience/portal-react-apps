// Node Rendering Constants
export const NODE_TYPES = {
  FOCUS: 'circle',
  PARENT: 'square',
  PREVIOUS: 'diamond',
  CHILD: 'triangle',
};

// Relationship Constants
export const RELATIONSHIPS = {
  PARENT: 'parent',
  CHILD: 'child',
};

// Layout Default Constants
export const LAYOUT_DEFAULTS = {
  leftMargin: 25,
  topMargin: 25,
  scale: 1,
  parentConnectorLength: 50,
};

export const SPACING_DEFAULTS = {
  row: 30,
  column: 80,
};

export const LABEL_DEFAULTS = {
  labelPadding: 8,
  // Keeping this an integer instead of rem due to calculations
  // based on this as a number value
  fontSize: 13,
  fontFamily: 'Inter, Helvetica, Arial, sans-serif',
  parentLabelLineGap: 5,
  verticalOffset: '0.32em',
};

export const SVG_DEFAULTS = {
  bottomPadding: 100,
  containerPadding: 32,
};
