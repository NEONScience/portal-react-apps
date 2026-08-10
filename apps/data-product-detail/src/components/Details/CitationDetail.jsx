import React from 'react';

import DataProducCitation from '@neonscience/portal-core-components/components/Citation/DataProductCitation';

import DataProductContext from '../DataProductContext';
import Detail from './Detail';

const CitationDetail = () => {
  const [state] = DataProductContext.useDataProductContextState();
  const {
    route: { productCode, release: currentRelease },
  } = state;
  return (
    <Detail title="Citation">
      <DataProducCitation productCode={productCode} release={currentRelease} />
    </Detail>
  );
};

export default CitationDetail;
