import React, {
  useLayoutEffect,
  useRef,
} from 'react';
import {
  buildGraphData,
  prepareTreeData,
  computeLayout,
  buildConfig,
} from './TreeGraphLayout';
import {
  renderTree,
  getGraphContainer,
} from './TreeGraphRenderer';
import type {
  TreeNode,
  SampleView,
  TreeConfig,
  GraphData,
} from './TreeGraph.types';

type TreeGraphProps = {
  data?: GraphData;
  visitedSamples?: {
    sampleViews?: SampleView[];
  };
  config?: TreeConfig;
  containerHeight?: number;
  onClickNode?: (node: TreeNode) => void;
};

const TreeWithParents = ({
  data = { nodes: [], links: [] },
  visitedSamples,
  config = {},
  containerHeight = 0,
  onClickNode,
}: TreeGraphProps) => {
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
        `TreeWithParents requires exactly one focus node. Found ${focusNodes.length}.`,
      );
      return () => { container.selectAll('*').remove(); };
    }
    const {
      focusNode,
      longestParentLabelWidth,
      focusRadius,
    } = prepareTreeData({
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
    renderTree({
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
        overflow: 'visible',
      }}
    />
  );
};
export default TreeWithParents;
