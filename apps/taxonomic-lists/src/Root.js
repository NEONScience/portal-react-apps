import React, { Component } from "react";
import { Provider } from "react-redux"

import NeonRouter from 'portal-core-components/lib/components/NeonRouter';

import App from "./components/app/App";
import { store } from "./store/store"

class Root extends Component {
	render() {
		return (
			<Provider store={store}>
        <NeonRouter>
          <App />
        </NeonRouter>
			</Provider>
		);
	}
}

export default Root;
