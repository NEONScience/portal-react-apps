import React from 'react';
import { ThemeProvider, StyledEngineProvider, createTheme } from '@mui/material/styles';
import {
  BrowserRouter,
} from 'react-router-dom';

import NeonRouter from 'portal-core-components/lib/components/NeonRouter';

import PrototypeContext from './PrototypeContext';
import PrototypePage from './PrototypePage';

const theme = createTheme();

export default function App() {
  return (
    <BrowserRouter>
      <NeonRouter disableRedirect cleanPath={false}>
        <PrototypeContext.Provider>
          <StyledEngineProvider injectFirst>
            <ThemeProvider theme={theme}>
              <PrototypePage />
            </ThemeProvider>
          </StyledEngineProvider>
        </PrototypeContext.Provider>
      </NeonRouter>
    </BrowserRouter>
  );
}
