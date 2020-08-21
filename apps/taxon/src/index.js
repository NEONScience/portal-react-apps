import "core-js/features/object/assign";
import "core-js/features/object/values";
import "core-js/features/map";
import "core-js/features/set";
import "core-js/features/string/pad-start";
import "core-js/features/array/fill";
import "core-js/features/array/flat";
import "core-js/features/array/flat-map";
import "core-js/features/promise";

import React from "react";
import ReactDOM from "react-dom";

import Root from "./Root";

import "./index.css";

ReactDOM.render(
  <Root />,
  document.getElementById("root")
);
