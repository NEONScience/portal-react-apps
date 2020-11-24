/* eslint-disable react/jsx-one-expression-per-line */
import React from 'react';

import { CopyToClipboard } from 'react-copy-to-clipboard';

import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import CopyIcon from '@material-ui/icons/Assignment';

import Theme from 'portal-core-components/lib/components/Theme';

import DataProductContext from '../DataProductContext';
import Detail from './Detail';

const DoiDetail = () => {
  const [state] = DataProductContext.useDataProductContextState();
  const product = DataProductContext.getCurrentProductFromState(state);

  const { route: { release: currentRelease } } = state;

  const doi = currentRelease ? ((product.dois || [])[0] || {}).url || 'n/a' : 'n/a';

  const tooltip = (
    <React.Fragment>
      Digital Object Identifier (DOI) - A citable permanent link to this this data product release
    </React.Fragment>
  );

  const style = {
    overflowWrap: 'break-word',
    color: Theme.palette.grey[500],
    fontWeight: 600,
    marginBottom: Theme.spacing(doi === 'n/a' ? 0 : 1),
  };

  return (
    <Detail
      title="DOI"
      tooltip={tooltip}
    >
      <Typography style={style}>{doi}</Typography>
      {doi === 'n/a' ? null : (
        <CopyToClipboard text={doi}>
          <Button color="primary" variant="outlined" size="small">
            <CopyIcon fontSize="small" />
            Copy
          </Button>
        </CopyToClipboard>
      )}
    </Detail>
  );
};

export default DoiDetail;
