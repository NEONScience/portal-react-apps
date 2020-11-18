import React from 'react';

import NeonPage from 'portal-core-components/lib/components/NeonPage';
import NeonRouter from 'portal-core-components/lib/components/NeonRouter';

// import { AppStatuses } from './actions';
// import { StoreContext } from './Store';

import DataProductContext from './components/DataProductContext';
// import DataProductPage from './components/DataProductPage';

export default function App() {
  /*
  const { state, actions } = React.useContext(StoreContext);
  const { appStatus, productCodeToFetch, bundleParentCodesToFetch } = state;

  // Trigger actions from particular app statuses
  useEffect(() => {
    if (appStatus === null) {
      actions.initialize();
    } else if (appStatus === AppStatuses.READY_TO_FETCH) {
      actions.fetchProductData(productCodeToFetch, bundleParentCodesToFetch);
    }
  }, [
    appStatus,
    productCodeToFetch,
    bundleParentCodesToFetch,
    actions,
  ]);

  let loading = null;
  let error = null;

  if (appStatus !== AppStatuses.FETCH_SUCCESS) {
    loading = 'Loading data product...';
  }
  if (appStatus === AppStatuses.FETCH_ERROR) {
    error = state.error ? `Error loading data product: ${state.error}` : 'Data product not found';
  }
  */

  return (
    <NeonRouter disableRedirect cleanPath={false}>
      <DataProductContext.Provider>
        <NeonPage loading="Loading data product...">
          ...
        </NeonPage>
      </DataProductContext.Provider>
    </NeonRouter>
  );
}
