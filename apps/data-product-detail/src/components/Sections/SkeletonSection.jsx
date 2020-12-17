import React from 'react';

import Grid from '@material-ui/core/Grid';
import Skeleton from '@material-ui/lab/Skeleton';

import Section from './Section';

const SkeletonSection = (props) => (
  <Section {...props} skeleton>
    <Grid container spacing={3}>

      <Grid item xs={12} md={5} lg={4}>
        <Skeleton width="20%" height={16} style={{ marginBottom: '16px' }} />
        <Skeleton width="100%" height={8} />
        <br />
        <Skeleton width="25%" height={16} style={{ marginBottom: '16px' }} />
        <Skeleton width="50%" height={8} />
        <br />
        <Skeleton width="20%" height={16} style={{ marginBottom: '16px' }} />
        <Skeleton width="100%" height={8} />
        <Skeleton width="40%" height={8} />
        <br />
        <Skeleton width="30%" height={16} style={{ marginBottom: '16px' }} />
        <Skeleton width="100%" height={8} />
        <Skeleton width="80%" height={8} />
      </Grid>

      <Grid item xs={12} md={7} lg={8}>
        <Skeleton width="20%" height={16} style={{ marginBottom: '16px' }} />
        <Skeleton width="100%" height={8} />
        <Skeleton width="100%" height={8} />
        <Skeleton width="100%" height={8} />
        <Skeleton width="40%" height={8} />
        <br />
        <Skeleton width="25%" height={16} style={{ marginBottom: '16px' }} />
        <Skeleton width="100%" height={8} />
        <Skeleton width="100%" height={8} />
        <Skeleton width="100%" height={8} />
        <Skeleton width="30%" height={8} />
        <br />
        <Skeleton width="25%" height={16} style={{ marginBottom: '16px' }} />
        <Skeleton width="50%" height={8} />
      </Grid>

    </Grid>
  </Section>
);

export default SkeletonSection;
