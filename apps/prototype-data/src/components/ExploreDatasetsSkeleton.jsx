import React from 'react';

import { makeStyles } from '@material-ui/core/styles';

import Theme from 'portal-core-components/lib/components/Theme';

import SkeletonDataset from './SkeletonDataset';

import { getSkeleton } from '../renderUtil';

const useStyles = makeStyles((theme) => ({
  filters: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(4),
  },
}));

const ExploreDatasetsSkeleton = () => {
  const classes = useStyles(Theme);

  return (
    <div>
      <div className={classes.filters}>
        <div style={{ marginRight: Theme.spacing(4) }}>
          {getSkeleton(27, 60, 1, false)}
          {getSkeleton(48, 225, 0, false, 'rect')}
        </div>
        <div style={{ width: '70%' }}>
          {getSkeleton(27, 100, 1, false)}
          {getSkeleton(37, 100, 1, true, 'rect')}
          {getSkeleton(16, 80, 0)}
        </div>
      </div>
      {getSkeleton(22, 250, 4, false)}
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
