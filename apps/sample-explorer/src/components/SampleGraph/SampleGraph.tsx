import React, {
  useLayoutEffect,
  useRef,
} from 'react';
import {
  buildGraphData,
  prepareGraphData,
  computeLayout,
  buildConfig,
} from './SampleGraphLayout';
import {
  renderGraph,
  getGraphContainer,
} from './SampleGraphRenderer';
import type {
  GraphNode,
  SampleView,
  GraphConfig,
  GraphData,
} from './types';

type SampleGraphProps = {
  data?: GraphData;
  visitedSamples?: {
    sampleViews?: SampleView[];
  };
  config?: GraphConfig;
  containerHeight?: number;
  onClickNode?: (node: GraphNode) => void;
};

const EMPTY_GRAPH_DATA: GraphData = {
  nodes: [],
  links: [],
};

const SampleGraph = ({
  data = EMPTY_GRAPH_DATA,
  visitedSamples,
  config = {},
  containerHeight = 0,
  onClickNode,
}: SampleGraphProps) => {
  const ref = useRef<HTMLDivElement | null>(null);
  useLayoutEffect(() => {
    const container = getGraphContainer(ref.current);
    const {
      focusNodes,
      previousNodes,
      parentNodes,
      childNodes,
    } = buildGraphData({
      data,
      nodeStyles: config.nodeStyles,
    });
    const {
      labelFont,
      labelConfig,
      layoutConfig,
    } = buildConfig(config);
    if (focusNodes.length !== 1) {
      // eslint-disable-next-line no-console
      console.error(
        `SampleGraph requires exactly one focus node. Found ${focusNodes.length}.`,
      );
      return () => { container.selectAll('*').remove(); };
    }
    const {
      focusNode,
      longestParentLabelWidth,
      focusRadius,
    } = prepareGraphData({
      focusNodes,
      previousNodes,
      parentNodes,
      childNodes,
      sampleViews: visitedSamples?.sampleViews,
      labelFont,
    });
    // keep the graph clean by removing any existing SVG elements before rendering a new one.
    container.selectAll('*').remove();
    const {
      positionedNodes,
      positionedNodeById,
      positionedChildNodes,
      positionedFocusNode,
      firstParent,
      parentSpineX,
      svgHeight,
    } = computeLayout({
      parentNodes,
      childNodes,
      focusNode,
      longestParentLabelWidth,
      containerHeight,
      layoutConfig,
    });
    renderGraph({
      container,
      svgHeight,
      config,
      firstParent,
      parentSpineX,
      focusNode: positionedFocusNode,
      focusRadius,
      nodes: positionedNodes,
      labelConfig,
      onClickNode,
      nodeById: positionedNodeById,
      childNodes: positionedChildNodes,
      links: data.links,
      layoutConfig,
    });
    return () => { container.selectAll('*').remove(); };
  }, [
    data,
    config,
    onClickNode,
    containerHeight,
    visitedSamples?.sampleViews,
  ]);
  return (
    <div
      ref={ref}
      style={{
        width: '100%',
        height: '100%',
        overflow: 'visible',
      }}
    />
  );
};
export default SampleGraph;
