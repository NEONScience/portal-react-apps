import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";

import App from "../components/app/App";
import { store } from "../store/store";

// Mock the data table function
const $ = require("jquery");
$.DataTable();

global.it("renders without crashing", () => {
  const div = document.createElement("div");
  ReactDOM.render(
    <Provider store={store}>
      <App />
    </Provider>,
    div
	);
});
