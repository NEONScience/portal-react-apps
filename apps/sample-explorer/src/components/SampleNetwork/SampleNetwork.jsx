import {
  useRef,
  useState,
  useEffect,
  useCallback,
  useLayoutEffect,
} from 'react';

import PropTypes from 'prop-types';

import NeonContext from 'portal-core-components/lib/components/NeonContext/NeonContext';
import NeonEnvironment from 'portal-core-components/lib/components/NeonEnvironment';
import Theme from 'portal-core-components/lib/components/Theme';
import { makeStyles } from 'portal-core-components/lib/components/Theme/makeStyles';
import { exists } from 'portal-core-components/lib/util/typeUtil';

import { GRAPH_COLORS } from '../../util/appUtil';

import TreeWithParents from './TreeWithParents';

// This may not be importable once moved to portal-core-components, so we will keep it here for now.
import { NODE_TYPES } from './TreeWithParentsConstants';

const useStyles = makeStyles()(() => ({
  container: {
    cursor: "default",
    border: `1px solid ${Theme.palette.grey[400]}`,
    backgroundColor: Theme.palette.grey[50],
    overflow: "auto",
    resize: "vertical",
  },
}));
const treeConfig = {
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
    fontSize: 12.8,
    fontFamily: "Inter, Helvetica, Arial, sans-serif",
    labelPadding: 8,
    parentLabelLineGap: 5,
    verticalOffset: "0.32em",
  },
  svg: {
    bottomPadding: 100,
    containerPadding: 15,
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

function SampleNetwork(props) {
  const {
    onNodeClick,
    graphData,
    visitedSamples,
  } = props;

  const { classes } = useStyles();

  const neonContextSessionState =
    NeonContext.useNeonContextSessionState();

  const { canAccessData } =
    neonContextSessionState;

  const [height, setHeight] = useState(600);

  // Observe wrapper instead of container.
  // Observing container and updating its height
  // can trigger ResizeObserver loop warnings.
  const wrapperRef = useRef(null);

  // stores a mutable value between renders,
  // does not trigger re-render when changed. f94feec (Complete TreeWithParents refactor)
  const clickCooldownRef = useRef(false);
  // creates and register browser-managed objects.
  // Keeps the height of the container in sync with the wrapper.
  useLayoutEffect(() => {
    if (!wrapperRef.current) {
      return;
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

    return () => {
      observer.disconnect();
    };
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
    let url = `${NeonEnvironment.getFullApiPath('samples')}/view?sampleUuid=${safeId}`;
    if (typeof nodeData === 'object' && nodeData !== null && nodeData.sampleClass) {
      url += `&sampleClass=${encodeURIComponent(String(nodeData.sampleClass).trim())}`;
    }
    try {
      onNodeClick(url);
    } finally {
      resetClickCooldown();
    }
  };
  if (!exists(graphData?.nodes) || graphData.nodes.length <= 0) {
    return null;
  }
  return (
    <div ref={wrapperRef}>
      <div
        className={classes.container}
        style={{ height }}
      >
      <TreeWithParents
        data={graphData}
        visitedSamples={visitedSamples}
        config={treeConfig}
        containerHeight={height}
        onClickNode={(nodeData) => {
          if (!canAccessData) {
            return;
          }

          handleNodeClick(nodeData);
        }}
      />
      </div>
    </div>
  );
}

SampleNetwork.propTypes = {
  onNodeClick: PropTypes.func.isRequired,
  graphData: PropTypes.shape({
    nodes: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        sampleName: PropTypes.string.isRequired,
      }),
    ).isRequired,
  }).isRequired,
};
export default SampleNetwork;
