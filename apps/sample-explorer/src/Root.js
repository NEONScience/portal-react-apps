import React from "react";
import { Provider } from "react-redux";

import NeonRouter from 'portal-core-components/lib/components/NeonRouter';

import App from "./components/App";

import { configureInitialStore } from "./store/store";

const Root = () => (
  <Provider store={configureInitialStore()}>
    <NeonRouter>
      <App />
    </NeonRouter>
  </Provider>
);

export default Root;
