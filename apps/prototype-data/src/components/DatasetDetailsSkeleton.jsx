import React from 'react';

import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';

import Theme from 'portal-core-components/lib/components/Theme';

import { getSkeleton } from '../renderUtil';

const useStyles = makeStyles((theme) => ({
  section: {
    marginBottom: theme.spacing(4),
  },
  startFlex: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
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

const DatasetDetailsSkeleton = () => {
  const classes = useStyles(Theme);

  const getFileSkeleton = () => (
    <div className={classes.startFlex} style={{ marginBottom: Theme.spacing(1.5) }}>
      <div style={{ marginRight: Theme.spacing(2) }}>
        {getSkeleton(48, 48, 0, false, 'rect')}
      </div>
      <div style={{ flexGrow: 1 }}>
        {getSkeleton(18, [40, 65], 0.5)}
        {getSkeleton(18, [70, 100], 0)}
      </div>
    </div>
  );

  return (
    <div>
      <Grid container spacing={4}>

        {/* Left Column */}
        <Grid item xs={12} sm={12} md={8} lg={9} xl={10}>
          <div className={classes.section}>
            {getSkeleton(27, 240, 1.5, false)}
            {getSkeleton(30, 300, 0, false, 'rect')}
          </div>
          <div className={classes.section}>
            {getSkeleton(27, 120, 1.5, false)}
            {getSkeleton(33, 340, 2, false, 'rect')}
            {getSkeleton(23, 180, 1, false)}
            {getFileSkeleton()}
            {getFileSkeleton()}
            {getSkeleton(18, 100, 0)}
            {getSkeleton(18, [30, 70], 0)}
          </div>
          <div className={classes.section}>
            {getSkeleton(27, 220, 1.5, false)}
            {getSkeleton(18, 100)}
            {getSkeleton(18, 100)}
            {getSkeleton(18, 100)}
            {getSkeleton(18, [40, 80])}
          </div>
          <div className={classes.section}>
            {getSkeleton(27, 220, 1.5, false)}
            {getSkeleton(18, 100)}
            {getSkeleton(18, 100)}
            {getSkeleton(18, 100)}
            {getSkeleton(18, [40, 80])}
          </div>
          <div className={classes.section}>
            {getSkeleton(27, 200, 1.5, false)}
            {getSkeleton(18, 100)}
            {getSkeleton(18, 100)}
            {getSkeleton(18, 100)}
            {getSkeleton(18, [40, 80])}
          </div>
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} sm={12} md={4} lg={3} xl={2}>
          <div className={classes.section}>
            {getSkeleton(27, 140, 1.5, false)}
            {getSkeleton(23, 80, 0, false)}
          </div>
          <div className={classes.section}>
            {getSkeleton(27, 120, 1.5, false)}
            {getSkeleton(23, 180, 0, false)}
          </div>
          <div className={classes.section}>
            {getSkeleton(27, 150, 1.5, false)}
            {getSkeleton(32, 32, 0, false, 'rect')}
          </div>
          <div className={classes.section}>
            {getSkeleton(27, 160, 1.5, false)}
            {getSkeleton(23, 80, 0)}
          </div>
          <div className={classes.section}>
            {getSkeleton(27, 160, 1.5, false)}
            <div className={classes.keywordChips}>
              {getSkeleton(24, [60, 170], 1, false, 'rect')}
              {getSkeleton(24, [60, 170], 1, false, 'rect')}
              {getSkeleton(24, [60, 170], 1, false, 'rect')}
              {getSkeleton(24, [60, 170], 1, false, 'rect')}
              {getSkeleton(24, [60, 170], 1, false, 'rect')}
              {getSkeleton(24, [60, 170], 1, false, 'rect')}
              {getSkeleton(24, [60, 170], 1, false, 'rect')}
              {getSkeleton(24, [60, 170], 1, false, 'rect')}
              {getSkeleton(24, [60, 170], 1, false, 'rect')}
            </div>
          </div>
          <div className={classes.section}>
            {getSkeleton(27, 160, 1.5, false)}
            <div style={{ margin: Theme.spacing(0, 0, 2, 1.5) }}>
              {getSkeleton(18, 100, 0.5)}
              {getSkeleton(18, 100, 0, false)}
            </div>
            <div style={{ margin: Theme.spacing(0, 0, 2, 1.5) }}>
              {getSkeleton(18, 100, 0.5)}
              {getSkeleton(18, 100, 0, false)}
            </div>
          </div>
        </Grid>

      </Grid>
    </div>
  );
};

export default DatasetDetailsSkeleton;
