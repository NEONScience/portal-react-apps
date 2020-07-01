import React from "react";

import { makeStyles } from '@material-ui/core/styles';
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";

import Skeleton from "@material-ui/lab/Skeleton";

import Theme from 'portal-core-components/lib/components/Theme';

const useStyles = makeStyles(theme => ({
  productPaper: {
    padding: theme.spacing(3),
    marginBottom: theme.spacing(3),
  },
}));

const SkeletonDataProduct = () => {
  const classes = useStyles(Theme);
  return (
    <Paper className={classes.productPaper}>

      <Grid container spacing={2} style={{ marginBottom: Theme.spacing(2) }}>
        <Grid item xs={12} sm={7} md={8} lg={9}>
          <Skeleton height={16} width="80%" style={{ marginBottom: Theme.spacing(2) }} />
          <Skeleton height={8} width="100%" style={{ marginBottom: Theme.spacing(1) }} />
          <Skeleton height={8} width="100%" style={{ marginBottom: Theme.spacing(1) }} />
          <Skeleton height={8} width="60%" style={{ marginBottom: Theme.spacing(1) }} />
        </Grid>
        <Grid item xs={12} sm={5} md={4} lg={3}>
          <Skeleton height={32} width="100%" variant="rect" style={{ marginBottom: Theme.spacing(1.5) }} />
          <Skeleton height={32} width="100%" variant="rect" style={{ marginBottom: Theme.spacing(1.5) }} />
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
            <Skeleton height={32} width={32} variant="rect" style={{ marginRight: Theme.spacing(0.5) }} />
            <Skeleton height={32} width={32} variant="rect" style={{ marginRight: Theme.spacing(0.5) }} />
          </div>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Skeleton height={8} width="60%" style={{ marginBottom: Theme.spacing(1) }} />
          <Skeleton height={32} width="100%" variant="rect" style={{ marginBottom: Theme.spacing(1) }} />
        </Grid>
      </Grid>

      <Skeleton height={80} width="100%" variant="rect" />

    </Paper>
  );
};

export default SkeletonDataProduct;
