import React, {
  useRef,
  useState,
  useLayoutEffect,
} from 'react';

import PropTypes from 'prop-types';

import Card from '@mui/material/Card';

import NeonAuthContext from '@neonscience/portal-core-components/components/NeonContext/NeonAuthContext';
import NeonEnvironment from '@neonscience/portal-core-components/components/NeonEnvironment';
import { makeStyles } from '@neonscience/portal-core-components/components/Theme/makeStyles';
import { exists } from '@neonscience/portal-core-components/util/typeUtil';

import SampleGraph from './SampleGraph';
import { GRAPH_COLORS } from '../../util/appUtil';
import { NODE_TYPES } from './SampleGraphConstants';

const useStyles = makeStyles()((theme) => ({
  container: {
    cursor: 'default',
    backgroundColor: theme.palette.grey[50],
    padding: theme.spacing(2, 2),
    overflow: 'auto',
  },
}));
const graphConfig = {
  spacing: {
    column: 80,
    row: 30,
  },
  layout: {
    leftMargin: 25,
    topMargin: 25,
    parentConnectorLength: 50,
    scale: 1,
  },
  labels: {
    // Keeping this an integer instead of rem due to calculations
    // based on this as a number value
    fontSize: 13,
    fontFamily: 'Inter, Helvetica, Arial, sans-serif',
    labelPadding: 8,
    parentLabelLineGap: 5,
    verticalOffset: '0.32em',
  },
  svg: {
    bottomPadding: 100,
    containerPadding: 32,
  },
  link: {
    stroke: GRAPH_COLORS.LINKS,
    strokeWidth: 1.5,
  },
  nodeStyles: {
    [NODE_TYPES.FOCUS]: {
      fill: GRAPH_COLORS.NODES.FOCUS,
      stroke: GRAPH_COLORS.NODES.FOCUS,
      strokeWidth: 1.5,
      symbolSize: 200,
    },
    [NODE_TYPES.PARENT]: {
      fill: GRAPH_COLORS.NODES.PARENT,
      stroke: GRAPH_COLORS.NODES.PARENT,
      strokeWidth: 1.5,
      symbolSize: 200,
    },
    [NODE_TYPES.CHILD]: {
      fill: GRAPH_COLORS.NODES.CHILD,
      stroke: GRAPH_COLORS.NODES.CHILD,
      strokeWidth: 1.5,
      symbolSize: 200,
    },
    [NODE_TYPES.PREVIOUS]: {
      fill: GRAPH_COLORS.NODES.PREVIOUS,
      stroke: GRAPH_COLORS.NODES.PREVIOUS,
      strokeWidth: 1.5,
      symbolSize: 200,
    },
  },
};
const CLICK_COOLDOWN_MS = 800; // milliseconds
const DEFAULT_CONTAINER_HEIGHT = 600;

const SampleGraphContainer = (props) => {
  const { onNodeClick, graphData, visitedSamples } = props;
  const { classes } = useStyles();

  const neonAuthContextSessionState = NeonAuthContext.useNeonAuthContextSessionState();
  const { canAccessData } = neonAuthContextSessionState;

  const [height, setHeight] = useState(DEFAULT_CONTAINER_HEIGHT);
  // Observe wrapper instead of container.
  // Observing container and updating its height
  // can trigger ResizeObserver loop warnings.
  const wrapperRef = useRef(null);
  // stores a mutable value between renders,
  const clickCooldownRef = useRef(false);
  // creates and register browser-managed objects.
  // Keeps the height of the container in sync with the wrapper.
  useLayoutEffect(() => {
    if (!wrapperRef.current) {
      return () => {};
    }
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];

      if (!entry) {
        return;
      }
      const newHeight = Math.ceil(entry.contentRect.height);
      if (newHeight > 100) {
        setHeight(newHeight);
      }
    });
    observer.observe(wrapperRef.current);
    return () => observer.disconnect();
  }, []);
  const resetClickCooldown = () => {
    setTimeout(() => {
      clickCooldownRef.current = false;
    }, CLICK_COOLDOWN_MS);
  };
  const handleNodeClick = (nodeData) => {
    if (!nodeData) { return; }
    if (clickCooldownRef.current) { return; }
    // Stores mutable state between renders without causing rerenders.
    clickCooldownRef.current = true;
    const id = (typeof nodeData === 'object' && nodeData !== null)
      ? (nodeData.id || nodeData.sampleUuid || nodeData.nodeid)
      : nodeData;
    if (!id) {
      resetClickCooldown();
      return;
    }
    const safeId = encodeURIComponent(String(id).trim());
    const url = `${NeonEnvironment.getFullApiPath('samples')}/view?sampleUuid=${safeId}`;
    try {
      onNodeClick(url);
    } finally {
      resetClickCooldown();
    }
  };
  if (!exists(graphData?.nodes) || (graphData.nodes.length <= 0)) {
    return null;
  }
  return (
    <div ref={wrapperRef}>
      <Card className={classes.container} style={{ height }}>
        <SampleGraph
          data={graphData}
          visitedSamples={visitedSamples}
          config={graphConfig}
          containerHeight={height}
          onClickNode={(nodeData) => {
            if (!canAccessData) {
              return;
            }
            handleNodeClick(nodeData);
          }}
        />
      </Card>
    </div>
  );
};

SampleGraphContainer.propTypes = {
  onNodeClick: PropTypes.func.isRequired,
  graphData: PropTypes.shape({
    nodes: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        sampleName: PropTypes.string.isRequired,
      }),
    ).isRequired,
  }).isRequired,
  visitedSamples: PropTypes.arrayOf(
    PropTypes.shape({
      sampleUuid: PropTypes.string.isRequired,

      parentSampleIdentifiers: PropTypes.arrayOf(
        PropTypes.shape({
          sampleUuid: PropTypes.string,
          sampleTag: PropTypes.string,
          sampleClass: PropTypes.string,
        }),
      ).isRequired,

      childSampleIdentifiers: PropTypes.arrayOf(
        PropTypes.shape({
          sampleUuid: PropTypes.string,
          sampleTag: PropTypes.string,
          sampleClass: PropTypes.string,
        }),
      ).isRequired,
    }),
  ).isRequired,
};
export default SampleGraphContainer;
