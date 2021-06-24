import React from 'react';
import { Provider } from 'react-redux';

import NeonContext from 'portal-core-components/lib/components/NeonContext/NeonContext';
import NeonRouter from 'portal-core-components/lib/components/NeonRouter/NeonRouter';

import App from './App';
import RootStore from '../store/store';

const Root = (): JSX.Element => (
  <Provider store={RootStore.configureInitialStore()}>
    <NeonRouter>
      <NeonContext.Provider useCoreAuth fetchPartials>
        <App />
      </NeonContext.Provider>
    </NeonRouter>
  </Provider>
);

export default Root;
