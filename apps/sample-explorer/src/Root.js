import React from "react";
import { Provider } from "react-redux";
import { ThemeProvider, createTheme } from '@material-ui/core/styles';

import NeonRouter from 'portal-core-components/lib/components/NeonRouter';

import App from "./components/App";

import { configureInitialStore } from "./store/store";

const theme = createTheme();

const Root = () => (
  <Provider store={configureInitialStore()}>
    <NeonRouter cleanPath={false} disableRedirect>
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    </NeonRouter>
  </Provider>
);

export default Root;
