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
import { createRoot } from 'react-dom/client';

import Root from './components/Root';

const root = createRoot(document.getElementById('root')!);
root.render(
  // https://v6.mui.com/system/styles/basics/
  // disabling strict mode for now until all apps are on MUI6 (or maybe React 19).
  // <React.StrictMode>
  <Root />,
  // </React.StrictMode>,
);
