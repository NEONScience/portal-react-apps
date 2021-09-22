import React from "react";

import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import Theme from 'portal-core-components/lib/components/Theme';

import FilterContainer from "../containers/FilterContainer";
import DownloadContainer from "../containers/DownloadContainer";

const useStyles = makeStyles(theme => ({
  outerContainer: {
    marginBottom: '20px',
    '@media (min-width:968px)': {
      marginBottom: '-38px',
    },
  },
  innerContainer: {
    display: 'flex',
    alignItems: 'top',
    justifyContent: 'flex-start',
  },
  downloadContainer: {
    marginLeft: theme.spacing(2),
  },
}));

const ControlPresentation = () => {
  const classes = useStyles(Theme);
  return (
    <div className={classes.outerContainer} >
      <Typography variant="h5" id="taxon-type-title" style={{ marginBottom: '16px' }}>
        Taxon Type
      </Typography>
      <div className={classes.innerContainer}>
        <div>
          <FilterContainer />
        </div>
        <div className={classes.downloadContainer}>
          <DownloadContainer />
        </div>
      </div>
    </div>
  );
};

export default ControlPresentation;
