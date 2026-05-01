import React from "react";
import { Provider } from "react-redux";

import NeonRouter from 'portal-core-components/lib/components/NeonRouter';

import App from "./components/App";

import { configureInitialStore } from "./store/store";

function Root() {
  return (
    <Provider store={configureInitialStore()}>
      <NeonRouter cleanPath={false} disableRedirect>
        <App />
      </NeonRouter>
    </Provider>
  );
}

export default Root;
