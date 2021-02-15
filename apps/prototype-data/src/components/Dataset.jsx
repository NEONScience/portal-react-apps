import React from 'react';
import PropTypes from 'prop-types';

import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

import DataThemeIcon from 'portal-core-components/lib/components/DataThemeIcon';
import Theme from 'portal-core-components/lib/components/Theme';

import PrototypeContext from '../PrototypeContext';

const { usePrototypeContextState } = PrototypeContext;

const useStyles = makeStyles((theme) => ({
  datasetCard: {
    marginBottom: theme.spacing(3),
  },
  title: {
    fontWeight: 500,
    marginBottom: theme.spacing(2),
  },
  startFlex: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  cardFirstColumnSection: {
    marginBottom: theme.spacing(2),
  },
  cardFirstColumnHeading: {
    fontWeight: 500,
    marginBottom: theme.spacing(1),
  },
}));

const Dataset = (props) => {
  const { uuid } = props;
  const classes = useStyles(Theme);

  const [state] = usePrototypeContextState();
  const { datasets: { [uuid]: dataset } } = state;

  if (typeof dataset === 'undefined') { return null; }

  const {
    dataThemes,
    endYear,
    projectDescription,
    projectTitle,
    startYear,
  } = dataset;

  const themeIcons = (dataThemes || []).sort().map((dataTheme) => (
    <div key={dataTheme} style={{ marginRight: Theme.spacing(0.5) }}>
      <DataThemeIcon theme={dataTheme} size={4} />
    </div>
  ));

  return (
    <Card className={classes.datasetCard}>
      <CardContent>
        <Typography variant="h6" className={classes.title}>
          {projectTitle}
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={2}>
            <div className={classes.cardFirstColumnSection}>
              <Typography variant="subtitle2" className={classes.cardFirstColumnHeading}>
                Time Range
              </Typography>
              <Typography variant="body2">
                {startYear === endYear ? startYear : `${startYear} – ${endYear}`}
              </Typography>
            </div>
            <div className={classes.cardFirstColumnSection}>
              <Typography variant="subtitle2" className={classes.cardFirstColumnHeading}>
                Data Themes
              </Typography>
              <div className={classes.startFlex}>
                {themeIcons}
              </div>
            </div>
          </Grid>
          <Grid item xs={12} sm={10}>
            <Typography variant="body2">
              {projectDescription}
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

Dataset.propTypes = {
  uuid: PropTypes.string.isRequired,
};

export default Dataset;
