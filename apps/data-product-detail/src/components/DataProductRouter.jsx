/* eslint-disable no-unused-vars */
import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
} from 'react-router-dom';

import DataProductContext from './DataProductContext';
import DataProductPage from './DataProductPage';

const { APP_STATUS, useDataProductContextState } = DataProductContext;

const DataProductRouter = () => {
  const [state] = useDataProductContextState();
  const {
    app: { status: appStatus, error: appError },
    route: { productCode },
    data: { productReleases },
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

  const pageProps = { loading, error };

  return appStatus !== APP_STATUS.READY ? (
    <DataProductPage {...pageProps} />
  ) : (
    <Router>
      <nav>
        <ul>
          <li>
            <Link to={`/data-products/${productCode || ''}`}>
              {productCode || 'product'}
            </Link>
          </li>
          {!productCode ? null : Object.keys(productReleases).map(release => (
            <li key={release}>
              <Link to={`/data-products/${productCode}/${release}`}>
                {`${productCode} | ${release}`}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <Switch>
        <Route path={`/data-products/${productCode || ''}`}>
          <DataProductPage {...pageProps} />
        </Route>
        {!productCode ? null : Object.keys(productReleases).forEach(release => (
          <Route path={`/data-products/${productCode}/${release}`}>
            <DataProductPage {...pageProps} />
          </Route>
        ))}
      </Switch>
    </Router>
  );
};

export default DataProductRouter;
