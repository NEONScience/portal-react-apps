import React from 'react';

import NeonRouter from 'portal-core-components/lib/components/NeonRouter';

import DataProductContext from './components/DataProductContext';
import DataProductRouter from './components/DataProductRouter';

export default function App() {
  return (
    <NeonRouter disableRedirect cleanPath={false}>
      <DataProductContext.Provider>
        <DataProductRouter />
      </DataProductContext.Provider>
    </NeonRouter>
  );
}
