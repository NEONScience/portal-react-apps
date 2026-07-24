import React from 'react';

import NeonJsonLd from 'portal-core-components/lib/components/NeonJsonLd';
import NeonRouter from 'portal-core-components/lib/components/NeonRouter';
import NeonThemeProvider from 'portal-core-components/lib/components/Theme/NeonThemeProvider';

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
