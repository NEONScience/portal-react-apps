import React, { Component } from "react";
import { Provider } from "react-redux"
import { ThemeProvider, StyledEngineProvider, createTheme } from '@mui/material/styles';

import NeonRouter from 'portal-core-components/lib/components/NeonRouter';

import App from "./components/app/App";
import { store } from "./store/store"

const theme = createTheme();

class Root extends Component {
	render() {
		return (
      <Provider store={store}>
        <NeonRouter>
          <StyledEngineProvider injectFirst>
            <ThemeProvider theme={theme}>
              <App />
            </ThemeProvider>
          </StyledEngineProvider>
        </NeonRouter>
      </Provider>
        );
	}
}

export default Root;
