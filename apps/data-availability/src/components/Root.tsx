import React, { type JSX } from 'react';
import { Provider } from 'react-redux';

import NeonContext from '@neonscience/portal-core-components/components/NeonContext/NeonContext';
import NeonRouter from '@neonscience/portal-core-components/components/NeonRouter/NeonRouter';
import NeonThemeProvider from '@neonscience/portal-core-components/components/Theme/NeonThemeProvider';

import App from './App';
import RootStore from '../store/store';

const Root = (): JSX.Element => (
  <Provider store={RootStore.configureInitialStore()}>
    <NeonRouter>
      <NeonContext.Provider useCoreAuth fetchPartials>
        <NeonThemeProvider>
          <App />
        </NeonThemeProvider>
      </NeonContext.Provider>
    </NeonRouter>
  </Provider>
);

export default Root;
