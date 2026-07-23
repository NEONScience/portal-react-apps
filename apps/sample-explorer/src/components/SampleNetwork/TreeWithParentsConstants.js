export const NODE_TYPES = Object.freeze({
  FOCUS: "circle",
  PARENT: "square",
  PREVIOUS: "diamond",
  CHILD: "triangle",
});

export const PREVIOUS_RELATIONSHIPS = Object.freeze({
  PARENT: "parent",
  CHILD: "child",
});

export const LABEL_DEFAULTS = Object.freeze({
  padding: 8,
  fontSize: 12.8,
  fontFamily:
    "Inter, Helvetica, Arial, sans-serif",
  parentLabelLineGap: 5,
  verticalOffset: "0.32em",
});

export const SVG_DEFAULTS = Object.freeze({
  bottomPadding: 100,
  containerPadding: 15,
});

export const SPACING_DEFAULTS = Object.freeze({
  row: 30,
  column: 80,
});

export const LAYOUT_DEFAULTS = Object.freeze({
  leftMargin: 25,
  topMargin: 25,
  scale: 1,
  parentConnectorLength: 50,
});
