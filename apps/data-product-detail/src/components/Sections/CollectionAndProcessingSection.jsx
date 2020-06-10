import React, { useContext } from 'react';
import Markdown from 'markdown-to-jsx';

import Grid from '@material-ui/core/Grid';

import { StoreContext } from '../../Store';
import Section from './Section';
import Detail from '../Details/Detail';
import DocumentationDetail from '../Details/DocumentationDetail';
import IssueLogDetail from '../Details/IssueLogDetail';

const CollectionAndProcessingSection = (props) => {
  const { state } = useContext(StoreContext);
  return (
    <Section {...props}>
      <Grid container spacing={3}>

        <Grid item xs={12}>
          <Detail
            title="Design Description"
            tooltip="More information about the science design can be found in this data product's documentation."
            content={(
              <Markdown>{state.product.productDesignDescription || '_n/a_'}</Markdown>
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <DocumentationDetail />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Detail
            title="Instrumentation"
            content={state.product.productSensor}
          />
        </Grid>

        <Grid item xs={12}>
          <IssueLogDetail />
        </Grid>

      </Grid>
    </Section>
  );
};

export default CollectionAndProcessingSection;
