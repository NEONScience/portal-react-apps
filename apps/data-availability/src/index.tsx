// Import polyfills to support IE11
import 'core-js/es/map';
import 'core-js/es/set';
import 'core-js/es/array';
import 'core-js/es/symbol';
import 'core-js/es/promise';
import 'core-js/es/number/is-integer';
import 'core-js/es/number/is-nan';
import 'core-js/es/number/is-finite';
import 'core-js/es/object/assign';
import 'core-js/es/object/entries';
import 'core-js/es/object/from-entries';
import 'core-js/es/object/values';
import 'core-js/es/string/includes';
import 'core-js/es/string/pad-start';
import 'core-js/es/string/starts-with';

import React from 'react';
import ReactDOM from 'react-dom';

import Root from './components/Root';

ReactDOM.render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
  document.getElementById('root'),
);
