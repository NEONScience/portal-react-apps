import React from 'react';

import { makeStyles } from '@material-ui/core/styles';
// import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';

import Skeleton from '@material-ui/lab/Skeleton';

import Theme from 'portal-core-components/lib/components/Theme';

const useStyles = makeStyles((theme) => ({
  datasetCard: {
    marginBottom: theme.spacing(3),
  },
}));

const SkeletonDataset = () => {
  const classes = useStyles(Theme);
  return (
    <Card className={classes.datasetCard}>
      <CardContent>

        {/*
        <Grid container spacing={2} style={{ marginBottom: Theme.spacing(2) }}>
          <Grid item xs={12} sm={7} md={8} lg={9}>
            <Skeleton height={16} width="80%" style={{ marginBottom: Theme.spacing(2) }} />
            <Skeleton height={8} width="100%" style={{ marginBottom: Theme.spacing(1) }} />
            <Skeleton height={8} width="100%" style={{ marginBottom: Theme.spacing(1) }} />
            <Skeleton height={8} width="60%" style={{ marginBottom: Theme.spacing(1) }} />
          </Grid>
          <Grid item xs={12} sm={5} md={4} lg={3}>
            <Skeleton height={32} width="100%" variant="rect" />
            <Skeleton height={32} width="100%" variant="rect" />
          </Grid>
        </Grid>

        <Grid container spacing={2} style={{ marginBottom: Theme.spacing(2) }}>
          <Grid item xs={12} sm={4}>
            <Skeleton height={8} width="50%" style={{ marginBottom: Theme.spacing(1) }} />
            <Skeleton height={8} width="40%" style={{ marginBottom: Theme.spacing(1) }} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Skeleton height={8} width="50%" style={{ marginBottom: Theme.spacing(1) }} />
            <div style={{ display: 'flex' }}>
              <Skeleton height={32} width={32} variant="rect" />
              <Skeleton height={32} width={32} variant="rect" />
            </div>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Skeleton height={8} width="60%" style={{ marginBottom: Theme.spacing(1) }} />
            <Skeleton height={32} width="100%" variant="rect" />
          </Grid>
        </Grid>
        */}

        <Skeleton height={80} width="100%" variant="rect" />

      </CardContent>
    </Card>
  );
};

export default SkeletonDataset;
