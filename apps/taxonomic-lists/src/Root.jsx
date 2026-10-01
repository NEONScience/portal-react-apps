import React from 'react';
import { Provider } from 'react-redux';

import NeonRouter from '@neonscience/portal-core-components/components/NeonRouter';
import NeonThemeProvider from '@neonscience/portal-core-components/components/Theme/NeonThemeProvider';

import App from './components/app/App';
import store from './store/store';

const Root = () => ((
  <Provider store={store}>
    <NeonRouter>
      <NeonThemeProvider>
        <App />
      </NeonThemeProvider>
    </NeonRouter>
  </Provider>
));

export default Root;
