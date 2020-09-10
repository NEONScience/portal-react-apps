import React from 'react';

import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import Theme from 'portal-core-components/lib/components/Theme';

const useStyles = makeStyles(theme => ({
  grid: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    '& > div': {
      margin: theme.spacing(0, 6, 3, 0),
    }
  },
  subtitle: {
    marginBottom: theme.spacing(1),    
  },
}));

const SampleInfoPresentation = (props) => {
  const {
    search: {
      sampleTag,
      sampleClass,
      barcode,
      archiveGuid,
    },
    query: {
      queryErrorStr,
    },
    sampleClassDesc,
  } = props;

  const classes = useStyles(Theme);

  if (queryErrorStr !== 'success') { return null; }

  const na = (
    <span style={{ fontStyle: 'italic', color: Theme.palette.grey[300] }}>n/a</span>
  );

  const sampleClassDescription = sampleClassDesc.get(sampleClass);

  return (
    <div className={classes.grid}>
      <div>
        <Typography variant="subtitle2" className={classes.subtitle}>
          Sample Tag
        </Typography>
        <Typography variant="body1">
          {sampleTag || na}
        </Typography>
      </div>
      <div>
        <Typography variant="subtitle2" className={classes.subtitle}>
          Barcode
        </Typography>
        <Typography variant="body1">
          {barcode || na}
        </Typography>
      </div>
      <div>
        <Typography variant="subtitle2" className={classes.subtitle}>
          Archive Guid
        </Typography>
        <Typography variant="body1">
          {archiveGuid || na}
        </Typography>
      </div>
      <div>
        <Typography variant="subtitle2" className={classes.subtitle}>
          Sample Class
        </Typography>
        <Typography variant="body1">
          {sampleClass || na}
        </Typography>
        {!sampleClassDescription ? null : (
          <Typography variant="body1" style={{ marginTop: Theme.spacing(1) }}>
            {sampleClassDescription}
          </Typography>
        )}
      </div>
    </div>
  );
};

export default SampleInfoPresentation;
