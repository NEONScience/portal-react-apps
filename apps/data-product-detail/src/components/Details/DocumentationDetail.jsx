import React from 'react';

import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

import DocumentList from 'portal-core-components/lib/components/Documents/DocumentList';
import DocumentSelect from 'portal-core-components/lib/components/Documents/DocumentSelect';

import DocumentService from 'portal-core-components/lib/service/DocumentService';
import { existsNonEmpty } from 'portal-core-components/lib/util/typeUtil';

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
        <Grid item xs={12}>
          <DocumentList
            documents={sortedDocs}
            enableDownloadButton
            enableVariantChips
            fetchVariants
          />
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h6" component="div" gutterBottom>
            Explore Documentation
          </Typography>
        </Grid>
        <Grid item xs={12}>
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
