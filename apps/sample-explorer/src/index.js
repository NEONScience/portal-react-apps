import "core-js/features/object/assign";
import "core-js/features/object/values";
import "core-js/features/map";
import "core-js/features/set";
import "core-js/features/string/pad-start";
import "core-js/features/string/includes";
import "core-js/features/symbol";
import "core-js/features/array";
import "core-js/features/promise";

import React from "react";
import { createRoot } from 'react-dom/client';
import Root from "./Root";

const container = document.getElementById("root");
const root = createRoot(container);
root.render(<Root/>);
