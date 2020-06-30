import React from "react";
import { Provider } from 'react-redux';

import NeonAuthRoot from 'portal-core-components/lib/components/NeonAuthRoot';

import App from "./App";

import { configureStore } from "../store/store";

const Root = () => (
  <Provider store={configureStore()}>
    <NeonAuthRoot
      app={(props) => { return (<App {...props} />); }}
    />
  </Provider>
);

export default Root;
