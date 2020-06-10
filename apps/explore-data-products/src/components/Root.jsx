import React from "react";
import { Provider } from 'react-redux';

import NeonAuthRoot from 'portal-core-components/lib/components/NeonAuthRoot';
import NeonContext from 'portal-core-components/lib/components/NeonContext';

import App from "./App";

import { configureInitialStore } from "../store/store";

const Root = () => {
  const [{ data: neonContextData }] = NeonContext.useNeonContextState();
  return (
    <Provider store={configureInitialStore(neonContextData)}>
      <NeonAuthRoot
        app={(props) => { return (<App {...props} />); }}
      />
    </Provider>
  );
};

export default Root;
