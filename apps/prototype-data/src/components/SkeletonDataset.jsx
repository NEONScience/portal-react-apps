import React from 'react';

import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Grid from '@material-ui/core/Grid';

import Theme from 'portal-core-components/lib/components/Theme';

import { getSkeleton } from '../renderUtil';

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
  cardFirstColumnSection: {
    marginBottom: theme.spacing(2),
  },
  keywordChips: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    '& span': {
      marginRight: theme.spacing(0.5),
    },
  },
}));

const SkeletonDataset = () => {
  const classes = useStyles(Theme);
  return (
    <Card className={classes.datasetCard}>
      <CardContent>
        {getSkeleton(25, [60, 80], 2)}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={2}>
            <div className={classes.cardFirstColumnSection}>
              {getSkeleton(22, 60, 1)}
              {getSkeleton(18, 30, 0)}
            </div>
            <div className={classes.cardFirstColumnSection}>
              {getSkeleton(22, 70, 1)}
              {getSkeleton(32, 32, 0, false, 'rect')}
            </div>
          </Grid>
          <Grid item xs={12} sm={10}>
            {getSkeleton(18, 100, 0.5)}
            {getSkeleton(18, 100, 0.5)}
            {getSkeleton(18, [30, 85], 3)}
            {getSkeleton(22, 60, 1)}
            <div className={classes.keywordChips}>
              {getSkeleton(24, [60, 170], 1, false, 'rect')}
              {getSkeleton(24, [60, 170], 1, false, 'rect')}
              {getSkeleton(24, [60, 170], 1, false, 'rect')}
              {getSkeleton(24, [60, 170], 1, false, 'rect')}
            </div>
          </Grid>
        </Grid>
      </CardContent>
      <CardActions className={classes.actions}>
        {getSkeleton(32, 235, 0, false, 'rect')}
      </CardActions>
    </Card>
  );
};

export default SkeletonDataset;
