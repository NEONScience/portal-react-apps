// Import polyfills to support IE11
import 'core-js/es/map';
import 'core-js/es/set';
import 'core-js/es/array';
import 'core-js/es/symbol';
import 'core-js/es/promise';
import 'core-js/es/number/is-integer';
import 'core-js/es/object/assign';
import 'core-js/es/object/values';
import 'core-js/es/string/match-all';
import 'core-js/es/string/pad-start';
import 'core-js/es/string/starts-with';
import 'core-js/es/string/includes';

import React from 'react';
import ReactDOM from 'react-dom';

import NeonJsonLd from 'portal-core-components/lib/components/NeonJsonLd';

import App from './App';
import { getProductCode } from './middleware';
import { StoreProvider } from './Store';

NeonJsonLd.injectProduct(getProductCode());

ReactDOM.render(
  <StoreProvider>
    <App />
  </StoreProvider>,
  document.getElementById('root'),
);
