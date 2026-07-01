import React, {
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

const useStyles = makeStyles()(() => ({
  container: {
    cursor: "move",
    border: `1px solid ${Theme.palette.grey[400]}`,
    backgroundColor: Theme.palette.grey[50],
    overflow: "auto",
    resize: "vertical",
  },
}));

function SampleNetwork(props) {
  const { onNodeClick, graphData } = props;
  const { classes } = useStyles();

  const neonContextSessionState = NeonContext.useNeonContextSessionState();
  const { canAccessData } = neonContextSessionState;

  const [width, setWidth] = useState(1100);
  const containerRef = useRef(null);
  const clickCooldownRef = useRef(false);

  useEffect(() => {
    if (!containerRef.current) return;
    const containerWidth = Math.ceil(containerRef.current.clientWidth);
    if (width !== containerWidth) {
      setWidth(containerWidth);
    }
  }, [width]);

  if (!exists(graphData) || graphData.nodes.length <= 0) {
    return null;
  }

  const getNodeClick = () => {
    if (!canAccessData) {
      return undefined;
    }

    return (nodeData) => {
      if (!nodeData) {
        return;
      }

      const nodeId =
        typeof nodeData === 'object'
          ? nodeData.id
          : nodeData;

      const url = `${NeonEnvironment.getFullApiPath('samples')}/view?sampleUuid=${nodeId}`;

      return onNodeClick(url);
    };
  };

  const treeConfig = {
    spacing: {
      column: 80,
      row: 20,
    },

    layout: {
      leftMargin: 10,
      topMargin: 10,
      elbowOffset: 20
    },

    link: {
      stroke: "#999",
      strokeWidth: 1.5
    },

    nodeStyles: {
      circle: {
        fill: "#1f4ea8",
        stroke: "#1f4ea8"
      },
      square: {
        fill: "#5c8f1a",
        stroke: "#5c8f1a"
      },
      triangle: {
        fill: "#5b9bd5",
        stroke: "#5b9bd5"
      },
      diamond: {
        fill: "#FFD966",
        stroke: "#D6B656"
      }
    }
  };


  return (
    <div className={classes.container} ref={containerRef}>
      <TreeWithParents
        data={graphData}
        config={treeConfig}
        onClickNode={(nodeData) => {
          if (!canAccessData) {
            return;
          }

          if (!nodeData) {
            return;
          }

          if (clickCooldownRef.current) {
            return;
          }

          clickCooldownRef.current = true;

          const id =
            (typeof nodeData === 'object' && nodeData !== null)
              ? (nodeData.id || nodeData.sampleUuid || nodeData.nodeid)
              : nodeData;

          if (!id) {
            setTimeout(() => {
              clickCooldownRef.current = false;
            }, 800);
            return;
          }

          const safeId = encodeURIComponent(String(id).trim());

          let url =
            `${NeonEnvironment.getFullApiPath('samples')}/view?sampleUuid=${safeId}`;

          if (
            typeof nodeData === 'object'
            && nodeData !== null
            && nodeData.sampleClass
          ) {
            url +=
              `&sampleClass=${
                encodeURIComponent(
                  String(nodeData.sampleClass).trim(),
                )
              }`;
          }

          try {
            onNodeClick(url);
          } finally {
            setTimeout(() => {
              clickCooldownRef.current = false;
            }, 800);
          }
        }}
      />
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
