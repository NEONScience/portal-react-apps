import React from "react";
import { Provider } from "react-redux";
import { ThemeProvider, StyledEngineProvider, createTheme } from '@mui/material/styles';

import NeonRouter from 'portal-core-components/lib/components/NeonRouter';

import App from "./components/App";

import { configureInitialStore } from "./store/store";

const theme = createTheme();

const Root = () => (
  <Provider store={configureInitialStore()}>
    <NeonRouter cleanPath={false} disableRedirect>
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <App />
        </ThemeProvider>
      </StyledEngineProvider>
    </NeonRouter>
  </Provider>
);

export default Root;
