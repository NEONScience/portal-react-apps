/* eslint-disable react/jsx-one-expression-per-line */

import React, { useContext } from 'react';

import Typography from '@material-ui/core/Typography';

import Detail from './Detail';

import { StoreContext } from '../../Store';

const IdentifierDetail = () => {
  const { state } = useContext(StoreContext);

  const fileNamingConventionsLink = (
    <a href="https://data.neonscience.org/file-naming-conventions">
      File Naming Conventions
    </a>
  );

  const tooltip = (
    <React.Fragment>
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
    </React.Fragment>
  );

  return (
    <Detail
      title="Product ID"
      tooltip={tooltip}
    >
      <Typography variant="button">{state.product.productCode}</Typography>
    </Detail>
  );
};

export default IdentifierDetail;
