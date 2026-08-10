import React from 'react';

import NeonJsonLd from '@neonscience/portal-core-components/components/NeonJsonLd';
import NeonRouter from '@neonscience/portal-core-components/components/NeonRouter';
import NeonThemeProvider from '@neonscience/portal-core-components/components/Theme/NeonThemeProvider';

import PrototypeContext from './PrototypeContext';
import PrototypePage from './PrototypePage';
import { getUuidFromURL } from './filterUtil';

const uuid = getUuidFromURL();
if (uuid) {
  NeonJsonLd.injectPrototypeDataset(uuid);
} else {
  NeonJsonLd.removeAllMetadata();
}

export default function App() {
  return (
    <NeonRouter disableRedirect cleanPath={false}>
      <PrototypeContext.Provider>
        <NeonThemeProvider>
          <PrototypePage />
        </NeonThemeProvider>
      </PrototypeContext.Provider>
    </NeonRouter>
  );
}
