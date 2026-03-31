/* eslint-disable import/no-unresolved */
import React from 'react';
import { ThemeProvider, createTheme } from '@material-ui/core/styles';

import NeonRouter from 'portal-core-components/lib/components/NeonRouter';

import DataProductContext from './components/DataProductContext';
import DataProductPage from './components/DataProductPage';

const theme = createTheme();

export default function App() {
  return (
    <NeonRouter disableRedirect cleanPath={false}>
      <DataProductContext.Provider>
        <ThemeProvider theme={theme}>
          <DataProductPage />
        </ThemeProvider>
      </DataProductContext.Provider>
    </NeonRouter>
  );
}
