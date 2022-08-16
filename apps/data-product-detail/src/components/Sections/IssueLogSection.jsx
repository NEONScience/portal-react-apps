import React from 'react';

import Grid from '@material-ui/core/Grid';

import DataProductContext from '../DataProductContext';

import Section from './Section';
import SkeletonSection from './SkeletonSection';

import IssueLogDetail from '../Details/IssueLogDetail';

const IssueLogSection = (props) => {
  const [state] = DataProductContext.useDataProductContextState();
  const product = DataProductContext.getCurrentProductFromState(state);

  return !product ? <SkeletonSection {...props} /> : (
    <Section {...props}>
      <Grid container spacing={3}>

        <Grid item xs={12}>
          <IssueLogDetail />
        </Grid>

      </Grid>
    </Section>
  );
};

export default IssueLogSection;
