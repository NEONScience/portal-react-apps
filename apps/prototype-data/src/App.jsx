import React from 'react';

import NeonRouter from 'portal-core-components/lib/components/NeonRouter';

import PrototypeContext from './PrototypeContext';
import PrototypePage from './PrototypePage';

export default function App() {
  return (
    <NeonRouter disableRedirect cleanPath={false}>
      <PrototypeContext.Provider>
        <PrototypePage />
      </PrototypeContext.Provider>
    </NeonRouter>
  );
}
