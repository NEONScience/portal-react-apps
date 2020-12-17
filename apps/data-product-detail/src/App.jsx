/* eslint-disable import/no-unresolved */
import React from 'react';

import NeonRouter from 'portal-core-components/lib/components/NeonRouter';

import DataProductContext from './components/DataProductContext';
import DataProductPage from './components/DataProductPage';

export default function App() {
  return (
    <NeonRouter disableRedirect cleanPath={false}>
      <DataProductContext.Provider>
        <DataProductPage />
      </DataProductContext.Provider>
    </NeonRouter>
  );
}
