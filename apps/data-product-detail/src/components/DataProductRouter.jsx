/* eslint-disable import/no-unresolved, no-unused-vars */
import React, { useEffect, useCallback } from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  useLocation,
  useHistory,
} from 'react-router-dom';

import Button from '@material-ui/core/Button';

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
  const loadType = currentRelease ? 'data product release' : 'data product';
  switch (appStatus) {
    case APP_STATUS.READY:
      break;
    case APP_STATUS.ERROR:
      error = appError
        ? `Error loading ${loadType}: ${appError}`
        : `Error: ${loadType} not found`;
      break;
    default:
      loading = `Loading ${loadType}...`;
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

  const releases = appStatus === APP_STATUS.READY
    ? product.dois.map(doi => ({ name: doi.release, doi: doi.url }))
    : null;
  const getPageProps = (release = null) => ({
    error,
    loading,
    sidebarLinksAdditionalContent: appStatus !== APP_STATUS.READY ? <ReleaseFilter skeleton /> : (
      <nav>
        <ReleaseFilter releases={releases} selected={release} onChange={handleReleaseChange} />
      </nav>
    ),
  });

  return appStatus !== APP_STATUS.READY ? <DataProductPage {...getPageProps()} /> : (
    <Router basename="/data-products" foreceRefresh={false}>
      <Switch>
        <Route path={productCode ? `/${productCode}` : ''} exact>
          <DataProductPage {...getPageProps()} />
        </Route>
        {!productCode ? null : Object.keys(productReleases).map(release => (
          <Route key={release} path={`/${productCode}/${release}`}>
            <DataProductPage {...getPageProps(release)} />
          </Route>
        ))}
      </Switch>
    </Router>
  );
};

export default DataProductRouter;
