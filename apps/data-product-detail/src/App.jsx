import React from 'react';

import NeonJsonLd from '@neonscience/portal-core-components/components/NeonJsonLd';
import NeonRouter from '@neonscience/portal-core-components/components/NeonRouter';
import NeonThemeProvider from '@neonscience/portal-core-components/components/Theme/NeonThemeProvider';

import DataProductContext from './components/DataProductContext';
import DataProductPage from './components/DataProductPage';

const [productCode, release] = DataProductContext.getProductCodeAndReleaseFromURL();
if (productCode) {
  NeonJsonLd.injectProduct(productCode, release);
}

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
