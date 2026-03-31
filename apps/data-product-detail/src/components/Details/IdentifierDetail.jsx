/* eslint-disable react/jsx-one-expression-per-line */
import React from 'react';

import makeStyles from '@mui/styles/makeStyles';
import Chip from '@mui/material/Chip';

import Theme from 'portal-core-components/lib/components/Theme';

import RouteService from 'portal-core-components/lib/service/RouteService';

import DataProductContext from '../DataProductContext';
import Detail from './Detail';

const useStyles = makeStyles((theme) => ({
  productCodeChip: {
    color: theme.palette.grey[500],
    border: `1px solid ${theme.palette.grey[500]}`,
    backgroundColor: theme.palette.grey[100],
    fontWeight: 600,
    height: '28px',
  },
}));

const IdentifierDetail = () => {
  const classes = useStyles(Theme);

  const [state] = DataProductContext.useDataProductContextState();
  const product = DataProductContext.getCurrentProductFromState(state);

  const fileNamingConventionsLink = (
    <a href={RouteService.getFileNamingConventionsPath()}>
      File Naming Conventions
    </a>
  );

  const tooltip = (
    <>
      <div>
        Data Products have unique identifiers in the form DPL.PRNUM.REV, where:
      </div>
      <ul>
        <li>DPL = data product level</li>
        <li>PRNUM = data product number</li>
        <li>REV = revision</li>
      </ul>
      <div>
        See {fileNamingConventionsLink} for more info.
      </div>
    </>
  );

  return (
    <Detail
      title="Product ID"
      tooltip={tooltip}
    >
      <Chip
        label={product.productCode}
        className={classes.productCodeChip}
      />
    </Detail>
  );
};

export default IdentifierDetail;
