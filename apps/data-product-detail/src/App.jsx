import React, { useEffect } from 'react';

import { AppStatuses } from './actions';
import { StoreContext } from './Store';

import DataProductPage from './components/DataProductPage';

export default function App() {
  const { state, actions } = React.useContext(StoreContext);
  const { appStatus, productCodeToFetch, bundleParentCodeToFetch } = state;

  // Trigger actions from particular app statuses
  useEffect(() => {
    if (appStatus === null) {
      actions.initialize();
    } else if (appStatus === AppStatuses.READY_TO_FETCH) {
      actions.fetchProductData(productCodeToFetch, bundleParentCodeToFetch);
    }
  }, [
    appStatus,
    productCodeToFetch,
    bundleParentCodeToFetch,
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

  return (
    <DataProductPage loading={loading} error={error}>
      ...
    </DataProductPage>
  );
}
