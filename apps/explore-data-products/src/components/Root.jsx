import React from "react";
import { Provider } from 'react-redux';

import NeonRouter from 'portal-core-components/lib/components/NeonRouter';

import App from "./App";

import { configureStore } from "../store/store";

const Root = () => (
  <Provider store={configureStore()}>
    <NeonRouter>
      <App />
    </NeonRouter>
  </Provider>
);

export default Root;
