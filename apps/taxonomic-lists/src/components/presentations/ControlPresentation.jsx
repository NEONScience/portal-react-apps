import React from 'react';

import { makeStyles } from 'portal-core-components/lib/components/Theme/makeStyles';
import Typography from '@mui/material/Typography';

import FilterContainer from '../containers/FilterContainer';
import DownloadContainer from '../containers/DownloadContainer';

const useStyles = makeStyles()((theme) => ({
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
  taxonTypeTitle: {
    marginBottom: theme.spacing(2),
  },
}));

function ControlPresentation() {
  const { classes } = useStyles();
  return (
    <div className={classes.outerContainer}>
      <Typography variant="h5" id="taxon-type-title" className={classes.taxonTypeTitle}>
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
}

export default ControlPresentation;
