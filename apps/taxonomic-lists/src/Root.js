import React, { Component } from "react";
import { Provider } from "react-redux"
import { ThemeProvider, createTheme } from '@material-ui/core/styles';

import NeonRouter from 'portal-core-components/lib/components/NeonRouter';

import App from "./components/app/App";
import { store } from "./store/store"

const theme = createTheme();

class Root extends Component {
	render() {
		return (
			<Provider store={store}>
        <NeonRouter>
			    <ThemeProvider theme={theme}>
          	<App />
		  	  </ThemeProvider>
        </NeonRouter>
			</Provider>
		);
	}
}

export default Root;
