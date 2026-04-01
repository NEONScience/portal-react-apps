import React from 'react';
import { ThemeProvider, createTheme } from '@material-ui/core/styles';

import NeonRouter from 'portal-core-components/lib/components/NeonRouter';

import PrototypeContext from './PrototypeContext';
import PrototypePage from './PrototypePage';

const theme = createTheme();

export default function App() {
  return (
    <NeonRouter disableRedirect cleanPath={false}>
      <PrototypeContext.Provider>
        <ThemeProvider theme={theme}>
          <PrototypePage />
        </ThemeProvider>
      </PrototypeContext.Provider>
    </NeonRouter>
  );
}
