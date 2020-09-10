import { exists } from "portal-core-components/lib/util/typeUtil";

/**
 * Determines if the current location has search params
 */
export const hasParams = () => {
  return exists(window.location.search) && (window.location.search.length > 0);
}

/**
 * Parse the URL search params into an object lookup
 * @param {*} paramNames Array of parameters names to parse
 * @return Object where keys are the param names
 *  and values are the param values. If the param has multiple values
 *  the value associated with the param key is an array.
 */
export const parseParams = (paramNames) => {
  let parseAll = false;
  if (!exists(paramNames)) {
    parseAll = true;
  }
  let params = null;
  if (typeof URLSearchParams === "undefined") {
    console.log("using URLSearchParams polyfill");
    require("url-search-params-polyfill");
    params = new URLSearchParams(window.location.search);
  } else {
    params = new URLSearchParams(window.location.search);
  }
  if (!exists(params)) {
    return {};
  }

  let parsed = {};
  for (let p of params) {
    if (!parseAll && (paramNames.indexOf(p[0]) < 0)) {
      continue;
    }

    if (!exists(parsed[p[0]])) {
      parsed[p[0]] = p[1];
    } else {
      if (!Array.isArray(parsed[p[0]])) {
        let current = parsed[p[0]];
        parsed[p[0]] = [];
        parsed[p[0]].push(current);
        parsed[p[0]].push(p[1]);
      } else {
        parsed[p[0]].push(p[1]);
      }
    }
  }

  return parsed;
}

/**
 * Applies the key values from the params object to the target object
 * when a matching key is found
 * @param {*} target
 * @param {*} params
 */
export const applyParams = (target, params) => {
  if (!exists(target) || !exists(params)) {
    return;
  }

  for (let k in target) {
    if (target.hasOwnProperty(k) && params.hasOwnProperty(k)) {
      if (Array.isArray(target[k])) {
        if (Array.isArray(params[k])) {
          target[k] = params[k];
        } else {
          target[k].push(params[k]);
        }
      } else {
        target[k] = params[k];
      }
    }
  }

  return target;
}
