// Import polyfills to support IE11
import "core-js/features/object/assign";
import "core-js/features/object/values";
import "core-js/features/map";
import "core-js/features/set";
import "core-js/features/array";
import "core-js/features/symbol";
import "core-js/features/promise";
import "core-js/features/string/includes";
import 'core-js/features/string/match-all';
import "core-js/features/string/pad-start";

import React from "react";
import ReactDOM from "react-dom";
import Root from "./components/Root";

ReactDOM.render(
  <Root></Root>,
  document.getElementById("root")
);
