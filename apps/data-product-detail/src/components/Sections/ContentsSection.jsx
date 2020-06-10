import React, { useContext } from 'react';

import Typography from '@material-ui/core/Typography';

import { StoreContext } from '../../Store';
import Section from './Section';

const ContentsSection = () => {
  const { state } = useContext(StoreContext);
  return (
    <Section title="Dataset Contents">
      <Typography>{state.product.productCode}</Typography>
    </Section>
  );
};

export default ContentsSection;
