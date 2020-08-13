import React from "react";
import { Provider } from 'react-redux';

import App from "./App";

import { configureStore } from "../store/store";

const Root = () => (
  <Provider store={configureStore()}>
    <App />
  </Provider>
);

export default Root;
