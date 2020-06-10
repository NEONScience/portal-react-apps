/* eslint-disable react/jsx-one-expression-per-line */

import React, { useContext } from 'react';
import dateFormat from 'dateformat';

import { CopyToClipboard } from 'react-copy-to-clipboard';

import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import CopyIcon from '@material-ui/icons/Assignment';

import Theme from 'portal-core-components/lib/components/Theme';

import Detail from './Detail';

import { StoreContext } from '../../Store';

const useStyles = makeStyles(theme => ({
  copyButton: {
    marginLeft: Theme.spacing(2),
    padding: Theme.spacing(0.5, 2),
    backgroundColor: '#fff',
  },
  startFlex: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: theme.spacing(1.5),
  },
}));

const CitationDetail = () => {
  const { state } = useContext(StoreContext);
  const classes = useStyles(Theme);

  const now = new Date();
  const year = dateFormat(now, 'yyyy');
  const today = dateFormat(now, 'mmmm d, yyyy');
  const maturity = 'Provisional';
  const url = 'http://data.neonscience.org';

  const dataPolicyLink = (
    <a href="https://data.neonscience.org/data-policy">
      Data Policy
    </a>
  );

  const citationText = `National Ecological Observatory Network. ${year}. Data Product ${state.product.productCode}, ${state.product.productName}. ${maturity} data downloaded from ${url} on ${today}. Battelle, Boulder, CO, USA NEON. ${year}.`;

  return (
    <Detail title="Citation">
      <div className={classes.startFlex}>
        <Typography variant="subtitle2">
          Please use this citation in your publications. See {dataPolicyLink} for more info.
        </Typography>
        <CopyToClipboard text={citationText}>
          <Button color="primary" variant="outlined" size="small" className={classes.copyButton}>
            <CopyIcon fontSize="small" style={{ marginRight: Theme.spacing(1) }} />
            Copy
          </Button>
        </CopyToClipboard>
      </div>
      <Typography variant="body2">
        {citationText}
      </Typography>
    </Detail>
  );
};

export default CitationDetail;
