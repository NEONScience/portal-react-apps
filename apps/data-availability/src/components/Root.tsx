import React, { type JSX } from 'react';
import { Provider } from 'react-redux';

import NeonContextProvider from '@neonscience/portal-core-components/components/NeonContext/NeonContextProvider';
import NeonRouter from '@neonscience/portal-core-components/components/NeonRouter/NeonRouter';
import NeonThemeProvider from '@neonscience/portal-core-components/components/Theme/NeonThemeProvider';

import App from './App';
import RootStore from '../store/store';

const Root = (): JSX.Element => (
  <Provider store={RootStore.configureInitialStore()}>
    <NeonRouter>
      <NeonContextProvider>
        <NeonThemeProvider>
          <App />
        </NeonThemeProvider>
      </NeonContextProvider>
    </NeonRouter>
  </Provider>
);

export default Root;
