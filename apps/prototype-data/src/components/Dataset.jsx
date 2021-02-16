import React from 'react';
import PropTypes from 'prop-types';

import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Chip from '@material-ui/core/Chip';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

import DataThemeIcon from 'portal-core-components/lib/components/DataThemeIcon';
import Theme from 'portal-core-components/lib/components/Theme';

import DetailsIcon from '@material-ui/icons/InfoOutlined';

import PrototypeContext from '../PrototypeContext';

const { usePrototypeContextState } = PrototypeContext;

const useStyles = makeStyles((theme) => ({
  actions: {
    justifyContent: 'flex-end',
  },
  content: {
    paddingBottom: theme.spacing(1.5),
  },
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
  sectionTitle: {
    fontWeight: 500,
    marginBottom: theme.spacing(1),
  },
  chip: {
    marginRight: theme.spacing(0.5),
    marginBottom: theme.spacing(1),
    maxWidth: '-webkit-fill-available',
  },
  chipMoz: {
    maxWidth: '-moz-available',
  },
}));

const Dataset = (props) => {
  const { uuid } = props;
  const classes = useStyles(Theme);

  const [state, dispatch] = usePrototypeContextState();
  const { datasets: { [uuid]: dataset } } = state;

  if (typeof dataset === 'undefined') { return null; }

  const {
    dataThemes,
    endYear,
    keywords,
    projectDescription,
    projectTitle,
    startYear,
  } = dataset;

  const themeIcons = (dataThemes || []).sort().map((dataTheme) => (
    <div key={dataTheme} style={{ marginRight: Theme.spacing(0.5) }}>
      <DataThemeIcon theme={dataTheme} size={4} />
    </div>
  ));

  const keywordChips = !(keywords || []).length ? null : keywords.map((keyword) => (
    <Chip
      label={keyword}
      key={keyword}
      size="small"
      className={`${classes.chip} ${classes.chipMoz}`}
    />
  ));

  return (
    <Card className={classes.datasetCard}>
      <CardContent className={classes.content}>
        <Typography variant="h6" className={classes.title}>
          {projectTitle}
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={2}>
            <div className={classes.cardFirstColumnSection}>
              <Typography variant="subtitle2" className={classes.sectionTitle}>
                Time Range
              </Typography>
              <Typography variant="body2">
                {startYear === endYear ? startYear : `${startYear} – ${endYear}`}
              </Typography>
            </div>
            <div className={classes.cardFirstColumnSection}>
              <Typography variant="subtitle2" className={classes.sectionTitle}>
                Data Themes
              </Typography>
              <div className={classes.startFlex}>
                {themeIcons}
              </div>
            </div>
          </Grid>
          <Grid item xs={12} sm={10}>
            <Typography variant="body2" style={{ marginBottom: Theme.spacing(3) }}>
              {projectDescription}
            </Typography>
            <div>
              <Typography variant="subtitle2" className={classes.sectionTitle}>
                Scientific Keywords
              </Typography>
              <div className={classes.startFlex} style={{ flexWrap: 'wrap' }}>
                {keywordChips}
              </div>
            </div>
          </Grid>
        </Grid>
      </CardContent>
      <CardActions className={classes.actions}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<DetailsIcon />}
          onClick={() => dispatch({ type: 'setNextUuid', uuid })}
        >
          Dataset Details and Download
        </Button>
      </CardActions>
    </Card>
  );
};

Dataset.propTypes = {
  uuid: PropTypes.string.isRequired,
};

export default Dataset;
