import React from 'react';
import { Provider } from 'react-redux';

import NeonRouter from 'portal-core-components/lib/components/NeonRouter';

import App from './App';
import RootStore from '../store/store';

const Root = (): JSX.Element => (
  <Provider store={RootStore.configureInitialStore()}>
    <NeonRouter>
      <App />
    </NeonRouter>
  </Provider>
);

export default Root;
