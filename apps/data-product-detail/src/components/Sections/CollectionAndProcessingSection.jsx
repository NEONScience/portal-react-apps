import React from 'react';
import Markdown from 'markdown-to-jsx';

import Grid from '@material-ui/core/Grid';

import DataProductContext from '../DataProductContext';

import Section from './Section';
import Detail from '../Details/Detail';
import DocumentationDetail from '../Details/DocumentationDetail';
import IssueLogDetail from '../Details/IssueLogDetail';

const CollectionAndProcessingSection = (props) => {
  const [state] = DataProductContext.useDataProductContextState();
  const product = DataProductContext.getCurrentProductFromState(state);

  return (
    <Section {...props}>
      <Grid container spacing={3}>

        <Grid item xs={12}>
          <Detail
            title="Study Description"
            content={(
              <Markdown>{product.productStudyDescription || '_n/a_'}</Markdown>
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <Detail
            title="Design Description"
            tooltip="More information about the science design can be found in this data product's documentation."
            content={(
              <Markdown>{product.productDesignDescription || '_n/a_'}</Markdown>
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <Detail
            title="Instrumentation"
            content={product.productSensor}
          />
        </Grid>

        <Grid item xs={12}>
          <DocumentationDetail />
        </Grid>

        <Grid item xs={12}>
          <IssueLogDetail />
        </Grid>

      </Grid>
    </Section>
  );
};

export default CollectionAndProcessingSection;
