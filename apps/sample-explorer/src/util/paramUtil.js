import { exists } from "portal-core-components/lib/util/typeUtil";

/**
 * Determines if the current location has search params
 */
export const hasParams = () => exists(window.location.search) && (window.location.search.length > 0);

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
    // eslint-disable-next-line no-console
    console.log("using URLSearchParams polyfill");
    // eslint-disable-next-line global-require
    require("url-search-params-polyfill");
    params = new URLSearchParams(window.location.search);
  } else {
    params = new URLSearchParams(window.location.search);
  }
  if (!exists(params)) {
    return {};
  }

  const parsed = {};
  // eslint-disable-next-line no-restricted-syntax
  for (const [key, value] of params) {
    if (!parseAll && (paramNames.indexOf(key) < 0)) {
      // eslint-disable-next-line no-continue
      continue;
    }

    if (!exists(parsed[key])) {
      parsed[key] = value;
    } else if (!Array.isArray(parsed[key])) {
      const current = parsed[key];
      parsed[key] = [];
      parsed[key].push(current);
      parsed[key].push(value);
    } else {
      parsed[key].push(value);
    }
  }

  return parsed;
};

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

  Object.keys(target).forEach((k) => {
    if (Object.prototype.hasOwnProperty.call(params, k)) {
      if (Array.isArray(target[k])) {
        if (Array.isArray(params[k])) {
          // eslint-disable-next-line no-param-reassign
          target[k] = params[k];
        } else {
          target[k].push(params[k]);
        }
      } else {
        // eslint-disable-next-line no-param-reassign
        target[k] = params[k];
      }
    }
  });

  // eslint-disable-next-line consistent-return
  return target;
};
