import React from 'react';
import { Provider } from 'react-redux';

import NeonRouter from 'portal-core-components/lib/components/NeonRouter';
import NeonThemeProvider from 'portal-core-components/lib/components/Theme/NeonThemeProvider';

import App from './components/app/App';
import store from './store/store';

function Root() {
  return (
    <Provider store={store}>
      <NeonRouter>
        <NeonThemeProvider>
          <App />
        </NeonThemeProvider>
      </NeonRouter>
    </Provider>
  );
}

export default Root;
