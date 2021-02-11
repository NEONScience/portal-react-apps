import React from 'react';

import NeonPage from 'portal-core-components/lib/components/NeonPage';

import PrototypeContext from './PrototypeContext';

const {
  APP_STATUS,
  usePrototypeContextState,
} = PrototypeContext;

const PrototypePage = () => {
  const [state] = usePrototypeContextState();

  const {
    app: { status: appStatus, error: appError },
  } = state;

  // Set loading and error page props
  let loading = null;
  let error = null;
  switch (appStatus) {
    case APP_STATUS.READY:
      break;
    case APP_STATUS.ERROR:
      error = appError;
      break;
    default:
      loading = 'Loading Prototype Datasets...';
      break;
  }
  // const skeleton = loading || error;

  return (
    <NeonPage
      title="Prototype Data"
      breadcrumbHomeHref="https://www.neonscience.org/"
      breadcrumbs={[]}
      loading={loading}
      error={error}
    >
      foo
    </NeonPage>
  );
};

export default PrototypePage;
