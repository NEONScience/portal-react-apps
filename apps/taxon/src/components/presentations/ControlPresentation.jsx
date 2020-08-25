import React from "react";

import { makeStyles } from '@material-ui/core/styles';

import Theme from 'portal-core-components/lib/components/Theme';

import FilterContainer from "../containers/FilterContainer";
import DownloadContainer from "../containers/DownloadContainer";

const useStyles = makeStyles(theme => ({
  container: {
    marginBottom: "20px",
    '@media (min-width:968px)': {
      marginBottom: "-48px",      
    },
  },
  filterContainer: {
    display: "inline-block",
  },
  downloadContainer: {
    display: "inline-block",
    verticalAlign: "bottom",
    marginLeft: theme.spacing(2),
    marginBottom: '11px',
  },
}));

const ControlPresentation = () => {
  const classes = useStyles(Theme);
  return (
    <div className={classes.container} >
      <div className={classes.filterContainer}>
        <FilterContainer />
      </div>
      <div className={classes.downloadContainer}>
        <DownloadContainer />
      </div>
    </div>
  );
};

export default ControlPresentation;
