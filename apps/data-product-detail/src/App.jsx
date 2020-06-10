import React from 'react';
import NeonAuthRoot from 'portal-core-components/lib/components/NeonAuthRoot';

import { AppStatuses } from './actions';
import { StoreContext } from './Store';

import DataProductPage from './components/DataProductPage';

export default function App() {
  const { state, actions } = React.useContext(StoreContext);

  let loading = 'Loading data product...';
  let error = null;

  // Trigger actions from particular app statuses
  switch (state.appStatus) {
    case null:
      actions.initialize();
      break;

    case AppStatuses.READY_TO_FETCH:
      actions.fetchProductData(state.productCodeToFetch, state.bundleParentCodeToFetch);
      break;

    case AppStatuses.FETCH_SUCCESS:
      loading = null;
      break;

    case AppStatuses.FETCH_ERROR:
      if (state.error) {
        error = `Error loading data product: ${state.error}`;
      } else {
        error = 'Data product not found';
      }
      break;

    default:
      break;
  }

  return (
    <NeonAuthRoot
      disableRedirect
      cleanPath={false}
      app={() => (
        <DataProductPage loading={loading} error={error}>
          ...
        </DataProductPage>
      )}
    />
  );
}
