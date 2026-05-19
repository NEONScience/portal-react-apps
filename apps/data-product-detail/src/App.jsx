import React from 'react';

import NeonRouter from 'portal-core-components/lib/components/NeonRouter';
import NeonThemeProvider from 'portal-core-components/lib/components/NeonPage/NeonThemeProvider';

import DataProductContext from './components/DataProductContext';
import DataProductPage from './components/DataProductPage';

export default function App() {
  return (
    <NeonRouter disableRedirect cleanPath={false}>
      <DataProductContext.Provider>
        <NeonThemeProvider>
          <DataProductPage />
        </NeonThemeProvider>
      </DataProductContext.Provider>
    </NeonRouter>
  );
}
