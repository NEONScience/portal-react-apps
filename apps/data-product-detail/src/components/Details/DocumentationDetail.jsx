import React from 'react';

import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import DocumentList from '@neonscience/portal-core-components/components/Documents/DocumentList';
import DocumentSelect from '@neonscience/portal-core-components/components/Documents/DocumentSelect';

import DocumentService from '@neonscience/portal-core-components/service/DocumentService';
import { existsNonEmpty } from '@neonscience/portal-core-components/util/typeUtil';

import DataProductContext from '../DataProductContext';
import Detail from './Detail';

const DocumentationDetail = () => {
  const [state] = DataProductContext.useDataProductContextState();
  const product = DataProductContext.getCurrentProductFromState(state);
  const { specs } = product;
  const documents = DocumentService.transformSpecs(specs);
  const renderDocumentation = () => {
    if (!existsNonEmpty(documents)) {
      return (<i>n/a</i>);
    }
    const sortedDocs = DocumentService.applyDisplaySort(documents, false, false);
    const qsgSortedDocs = DocumentService.applyDisplaySort(documents, false, true);
    const displayableDocs = qsgSortedDocs.filter((value) => (
      DocumentService.isViewerSupported(value)
    ));
    return (
      <Grid container spacing={2}>
        <Grid size={{ xs: 12 }}>
          <DocumentList
            documents={sortedDocs}
            enableDownloadButton
            enableVariantChips
            fetchVariants
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Typography variant="h6" component="div" gutterBottom>
            Explore Documentation
          </Typography>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <DocumentSelect documents={displayableDocs} />
        </Grid>
      </Grid>
    );
  };
  return (
    <Detail>
      {renderDocumentation()}
    </Detail>
  );
};

export default DocumentationDetail;
