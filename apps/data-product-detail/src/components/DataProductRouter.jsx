/* eslint-disable import/no-unresolved, no-unused-vars */
import React, { useEffect, useCallback } from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  useLocation,
  useHistory,
} from 'react-router-dom';

import ReleaseFilter from 'portal-core-components/lib/components/ReleaseFilter';

import DataProductContext from './DataProductContext';
import DataProductPage from './DataProductPage';

const {
  APP_STATUS,
  useDataProductContextState,
  getProductCodeAndReleaseFromURL,
} = DataProductContext;

const DataProductRouter = () => {
  const [state, dispatch] = useDataProductContextState();
  const {
    app: { status: appStatus, error: appError },
    route: { productCode, release: currentRelease },
    data: { product, productReleases },
  } = state;

  let loading = null;
  let error = null;
  switch (appStatus) {
    case APP_STATUS.READY:
      break;
    case APP_STATUS.ERROR:
      error = appError
        ? `Error loading data product: ${appError}`
        : 'Data product not found';
      break;
    default:
      loading = 'Loading data product...';
      break;
  }

  const history = useHistory();
  const location = useLocation();
  const { pathname } = location;

  const handleProductCodeChange = useCallback((newProductCode) => {
    history.push(`/data-products/${newProductCode}`);
    dispatch({ type: 'reinitialize' });
  }, [history, dispatch]);
  const handleReleaseChange = useCallback((newRelease) => {
    if (!newRelease || newRelease === 'n/a') {
      history.push(`/data-products/${productCode}`);
      dispatch({ type: 'setRelease', release: null });
    } else {
      history.push(`/data-products/${productCode}/${newRelease}`);
      dispatch({ type: 'setRelease', release: newRelease });
    }
  }, [history, dispatch, productCode]);

  useEffect(() => {
    if (appStatus !== APP_STATUS.READY) { return; }
    const [newProductCode, newRelease] = getProductCodeAndReleaseFromURL(pathname);
    if (productCode !== newProductCode) {
      handleProductCodeChange(newProductCode);
    } else if (currentRelease !== newRelease) {
      handleReleaseChange(newRelease);
    }
  }, [
    appStatus,
    pathname,
    productCode,
    currentRelease,
    handleProductCodeChange,
    handleReleaseChange,
  ]);

  const pageProps = {
    error,
    loading,
    sidebarLinksAdditionalContent: <ReleaseFilter skeleton />,
  };

  if (appStatus === APP_STATUS.READY) {
    pageProps.sidebarLinksAdditionalContent = (
      <nav>
        <ReleaseFilter
          releases={product.dois.map(doi => ({ name: doi.release, doi: doi.url }))}
          selected={currentRelease}
          onChange={handleReleaseChange}
        />
      </nav>
    );
  }

  return appStatus !== APP_STATUS.READY ? (
    <DataProductPage {...pageProps} />
  ) : (
    <Router basename="/data-products" foreceRefresh={false}>
      <Switch>
        <Route path={`/${productCode || ''}`} exact>
          <DataProductPage {...pageProps} />
        </Route>
        {!productCode ? null : Object.keys(productReleases).map(release => (
          <Route key={release} path={`/${productCode}/${release}`}>
            <DataProductPage {...pageProps} />
          </Route>
        ))}
      </Switch>
    </Router>
  );
};

export default DataProductRouter;
