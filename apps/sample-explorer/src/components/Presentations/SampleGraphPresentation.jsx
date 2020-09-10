import React from "react";

import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";

import Theme from 'portal-core-components/lib/components/Theme';

import SampleNetwork from "../SampleNetwork/SampleNetwork";
import { GRAPH_COLORS } from "../../util/appUtil";

const useStyles = makeStyles(theme => ({
  keyContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    margin: theme.spacing(2, 0, 3, 0),
  },
  keyElement: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginRight: theme.spacing(4),
    '& svg': {
      marginRight: theme.spacing(1),
    },
  },
}));

const SampleGraphPresentation = (props) => {
  const { onQueryClick, graphData } = props;
  const classes = useStyles(Theme);

  return (
    <div style={{ marginBottom: Theme.spacing(4) }} data-selenium="sample-graph-section">
      <Typography variant="h4" gutterBottom>
        Sample Graph
      </Typography>
      <Typography variant="subtitle1">
        Network graph displaying sample relationships. Navigate the sample network by clicking the nodes.
      </Typography>
      <div className={classes.keyContainer}>
        <div className={classes.keyElement}>
          <svg height="20" width="20">
            <circle cx="10" cy="10" r="10" style={{ fill: GRAPH_COLORS.NODES.FOCUS }}/>
          </svg>
          <Typography variant="body2" >
            Focus Sample
          </Typography>
        </div>
        <div className={classes.keyElement}>
          <svg height="20" width="20">
            <rect width="20" height="20" style={{ fill: GRAPH_COLORS.NODES.PARENT }} />
          </svg>
          <Typography variant="body2">
            Parent Sample
          </Typography>
        </div>
        <div className={classes.keyElement}>
          <svg height="20" width="20">
            <polygon points="10,0 20,20 0,20" style={{ fill: GRAPH_COLORS.NODES.CHILD }} />
          </svg>
          <Typography variant="body2" >
            Child Sample
          </Typography>
        </div>
        <div className={classes.keyElement}>
          <svg height="20" width="20">
            <polygon points="10,0 17,10 10,20 3,10 " style={{ fill: GRAPH_COLORS.NODES.PREVIOUS }} />
          </svg>
          <Typography variant="body2" >
            Previous Sample
          </Typography>
        </div>
      </div>
      <SampleNetwork onNodeClick={onQueryClick} graphData={graphData} />
    </div>
  );
};

export default SampleGraphPresentation;
