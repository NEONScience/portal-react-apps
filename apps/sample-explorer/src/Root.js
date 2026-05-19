import React from 'react';
import { Provider } from 'react-redux';

import NeonRouter from 'portal-core-components/lib/components/NeonRouter';
import NeonThemeProvider from 'portal-core-components/lib/components/NeonPage/NeonThemeProvider';

import App from './components/App';

import { configureInitialStore } from './store/store';

function Root() {
  return (
    <Provider store={configureInitialStore()}>
      <NeonRouter cleanPath={false} disableRedirect>
        <NeonThemeProvider>
          <App />
        </NeonThemeProvider>
      </NeonRouter>
    </Provider>
  );
}

export default Root;
