import React, { useContext } from 'react';

import Typography from '@material-ui/core/Typography';

import { StoreContext } from '../../Store';
import Section from './Section';

const UsageSection = () => {
  const { state } = useContext(StoreContext);
  return (
    <Section title="Using this Data Product">
      <Typography>{state.product.productCode}</Typography>
    </Section>
  );
};

export default UsageSection;
