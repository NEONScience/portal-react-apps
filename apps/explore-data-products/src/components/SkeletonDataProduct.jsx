import React from 'react';

import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';

import Skeleton from '@mui/material/Skeleton';

import { makeStyles } from 'portal-core-components/lib/components/Theme/makeStyles';

const useStyles = makeStyles()((theme) => ({
  productCard: {
    marginBottom: theme.spacing(3),
  },
}));

const SkeletonDataProduct = () => {
  const { classes, theme } = useStyles();
  return (
    <Card className={classes.productCard}>
      <CardContent>

        <Grid container spacing={2} style={{ marginBottom: theme.spacing(2) }}>
          <Grid
            size={{
              xs: 12,
              sm: 7,
              md: 8,
              lg: 9,
            }}
          >
            <Skeleton height={16} width="80%" style={{ marginBottom: theme.spacing(2) }} />
            <Skeleton height={8} width="100%" style={{ marginBottom: theme.spacing(1) }} />
            <Skeleton height={8} width="100%" style={{ marginBottom: theme.spacing(1) }} />
            <Skeleton height={8} width="60%" style={{ marginBottom: theme.spacing(1) }} />
          </Grid>
          <Grid
            size={{
              xs: 12,
              sm: 5,
              md: 4,
              lg: 3,
            }}
          >
            <Skeleton
              height={32}
              width="100%"
              variant="rectangular"
              style={{ marginBottom: theme.spacing(1.5) }}
            />
            <Skeleton
              height={32}
              width="100%"
              variant="rectangular"
              style={{ marginBottom: theme.spacing(1.5) }}
            />
          </Grid>
        </Grid>

        <Grid container spacing={2} style={{ marginBottom: theme.spacing(2) }}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Skeleton height={8} width="50%" style={{ marginBottom: theme.spacing(1) }} />
            <Skeleton height={8} width="40%" style={{ marginBottom: theme.spacing(1) }} />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Skeleton height={8} width="50%" style={{ marginBottom: theme.spacing(1) }} />
            <div style={{ display: 'flex' }}>
              <Skeleton
                height={32}
                width={32}
                variant="rectangular"
                style={{ marginRight: theme.spacing(0.5) }}
              />
              <Skeleton
                height={32}
                width={32}
                variant="rectangular"
                style={{ marginRight: theme.spacing(0.5) }}
              />
            </div>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Skeleton height={8} width="60%" style={{ marginBottom: theme.spacing(1) }} />
            <Skeleton
              height={32}
              width="100%"
              variant="rectangular"
              style={{ marginBottom: theme.spacing(1) }}
            />
          </Grid>
        </Grid>

        <Skeleton height={80} width="100%" variant="rectangular" />

      </CardContent>
    </Card>
  );
};

export default SkeletonDataProduct;
