/* eslint-disable import/no-unresolved */
import React from 'react';
import { ThemeProvider, StyledEngineProvider, createTheme } from '@mui/material/styles';

import NeonRouter from 'portal-core-components/lib/components/NeonRouter';

import DataProductContext from './components/DataProductContext';
import DataProductPage from './components/DataProductPage';

const theme = createTheme();

export default function App() {
  return (
    <NeonRouter disableRedirect cleanPath={false}>
      <DataProductContext.Provider>
        <StyledEngineProvider injectFirst>
          <ThemeProvider theme={theme}>
            <DataProductPage />
          </ThemeProvider>
        </StyledEngineProvider>
      </DataProductContext.Provider>
    </NeonRouter>
  );
}
