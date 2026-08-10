import React from 'react';

import { makeStyles } from '@neonscience/portal-core-components/components/Theme/makeStyles';

import SkeletonDataset from './SkeletonDataset';

import { getSkeleton } from '../renderUtil';

const useStyles = makeStyles()((theme) => ({
  filters: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(4),
  },
}));

const ExploreDatasetsSkeleton = () => {
  const { classes, theme } = useStyles();

  return (
    <div>
      <div className={classes.filters}>
        <div style={{ marginRight: theme.spacing(4) }}>
          {getSkeleton(theme, 27, 60, 1, false)}
          {getSkeleton(theme, 48, 225, 0, false, 'rect')}
        </div>
        <div style={{ width: '70%' }}>
          {getSkeleton(theme, 27, 100, 1, false)}
          {getSkeleton(theme, 37, 100, 1, true, 'rect')}
          {getSkeleton(theme, 16, 80, 0)}
        </div>
      </div>
      {getSkeleton(theme, 22, 250, 4, false)}
      <div>
        <SkeletonDataset />
        <SkeletonDataset />
        <SkeletonDataset />
        <SkeletonDataset />
        <SkeletonDataset />
      </div>
    </div>
  );
};

export default ExploreDatasetsSkeleton;
