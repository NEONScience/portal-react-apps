import React, { type JSX } from 'react';
import { Provider } from 'react-redux';
import { createTheme, ThemeProvider } from '@mui/material/styles';

import NeonContext from 'portal-core-components/lib/components/NeonContext/NeonContext';
import NeonRouter from 'portal-core-components/lib/components/NeonRouter/NeonRouter';

import App from './App';
import RootStore from '../store/store';

const theme = createTheme();

const Root = (): JSX.Element => (
  <Provider store={RootStore.configureInitialStore()}>
    <NeonRouter>
      <NeonContext.Provider useCoreAuth fetchPartials>
        <ThemeProvider theme={theme}>
          <App />
        </ThemeProvider>
      </NeonContext.Provider>
    </NeonRouter>
  </Provider>
);

export default Root;
