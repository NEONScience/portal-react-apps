import React from 'react';

import Grid from '@mui/material/Grid';

import { makeStyles } from 'portal-core-components/lib/components/Theme/makeStyles';

import { getSkeleton } from '../renderUtil';

const useStyles = makeStyles()((theme) => ({
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
  const { classes, theme } = useStyles();

  const getFileSkeleton = () => (
    <div className={classes.startFlex} style={{ marginBottom: theme.spacing(1.5) }}>
      <div style={{ marginRight: theme.spacing(2) }}>
        {getSkeleton(theme, 48, 48, 0, false, 'rect')}
      </div>
      <div style={{ flexGrow: 1 }}>
        {getSkeleton(theme, 18, [40, 65], 0.5)}
        {getSkeleton(theme, 18, [70, 100], 0)}
      </div>
    </div>
  );

  return (
    <div>
      <Grid container spacing={4}>

        {/* Left Column */}
        <Grid
          size={{
            xs: 12,
            sm: 12,
            md: 8,
            lg: 9,
            xl: 10,
          }}
        >
          <div className={classes.section}>
            {getSkeleton(theme, 27, 240, 1.5, false)}
            {getSkeleton(theme, 30, 300, 0, false, 'rect')}
          </div>
          <div className={classes.section}>
            {getSkeleton(theme, 27, 120, 1.5, false)}
            {getSkeleton(theme, 33, 340, 2, false, 'rect')}
            {getSkeleton(theme, 23, 180, 1, false)}
            {getFileSkeleton()}
            {getFileSkeleton()}
            {getSkeleton(theme, 18, 100, 0)}
            {getSkeleton(theme, 18, [30, 70], 0)}
          </div>
          <div className={classes.section}>
            {getSkeleton(theme, 27, 220, 1.5, false)}
            {getSkeleton(theme, 18, 100)}
            {getSkeleton(theme, 18, 100)}
            {getSkeleton(theme, 18, 100)}
            {getSkeleton(theme, 18, [40, 80])}
          </div>
          <div className={classes.section}>
            {getSkeleton(theme, 27, 220, 1.5, false)}
            {getSkeleton(theme, 18, 100)}
            {getSkeleton(theme, 18, 100)}
            {getSkeleton(theme, 18, 100)}
            {getSkeleton(theme, 18, [40, 80])}
          </div>
          <div className={classes.section}>
            {getSkeleton(theme, 27, 200, 1.5, false)}
            {getSkeleton(theme, 18, 100)}
            {getSkeleton(theme, 18, 100)}
            {getSkeleton(theme, 18, 100)}
            {getSkeleton(theme, 18, [40, 80])}
          </div>
        </Grid>

        {/* Right Column */}
        <Grid
          size={{
            xs: 12,
            sm: 12,
            md: 4,
            lg: 3,
            xl: 2,
          }}
        >
          <div className={classes.section}>
            {getSkeleton(theme, 27, 140, 1.5, false)}
            {getSkeleton(theme, 23, 80, 0, false)}
          </div>
          <div className={classes.section}>
            {getSkeleton(theme, 27, 120, 1.5, false)}
            {getSkeleton(theme, 23, 180, 0, false)}
          </div>
          <div className={classes.section}>
            {getSkeleton(theme, 27, 150, 1.5, false)}
            {getSkeleton(theme, 32, 32, 0, false, 'rect')}
          </div>
          <div className={classes.section}>
            {getSkeleton(theme, 27, 160, 1.5, false)}
            {getSkeleton(theme, 23, 80, 0)}
          </div>
          <div className={classes.section}>
            {getSkeleton(theme, 27, 160, 1.5, false)}
            <div className={classes.keywordChips}>
              {getSkeleton(theme, 24, [60, 170], 1, false, 'rect')}
              {getSkeleton(theme, 24, [60, 170], 1, false, 'rect')}
              {getSkeleton(theme, 24, [60, 170], 1, false, 'rect')}
              {getSkeleton(theme, 24, [60, 170], 1, false, 'rect')}
              {getSkeleton(theme, 24, [60, 170], 1, false, 'rect')}
              {getSkeleton(theme, 24, [60, 170], 1, false, 'rect')}
              {getSkeleton(theme, 24, [60, 170], 1, false, 'rect')}
              {getSkeleton(theme, 24, [60, 170], 1, false, 'rect')}
              {getSkeleton(theme, 24, [60, 170], 1, false, 'rect')}
            </div>
          </div>
          <div className={classes.section}>
            {getSkeleton(theme, 27, 160, 1.5, false)}
            <div style={{ margin: theme.spacing(0, 0, 2, 1.5) }}>
              {getSkeleton(theme, 18, 100, 0.5)}
              {getSkeleton(theme, 18, 100, 0, false)}
            </div>
            <div style={{ margin: theme.spacing(0, 0, 2, 1.5) }}>
              {getSkeleton(theme, 18, 100, 0.5)}
              {getSkeleton(theme, 18, 100, 0, false)}
            </div>
          </div>
        </Grid>

      </Grid>
    </div>
  );
};

export default DatasetDetailsSkeleton;
