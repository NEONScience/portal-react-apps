import { exists } from 'portal-core-components/lib/util/typeUtil';

/**
 * Determines if the current location has search params
 */
export const hasParams = () => exists(window.location.search)
  && (window.location.search.length > 0);

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
  if (typeof URLSearchParams === 'undefined') {
    // eslint-disable-next-line no-console
    console.log('using URLSearchParams polyfill');
    import('url-search-params-polyfill').then(() => {
      params = new URLSearchParams(window.location.search);
    });
  } else {
    params = new URLSearchParams(window.location.search);
  }
  if (!exists(params)) {
    return {};
  }

  const parsed = {};

  params.forEach((value, key) => {
    if (parseAll === true || paramNames.indexOf(key) >= 0) {
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
  });

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

  const updatedTarget = target;
  Object.keys(updatedTarget).forEach((targetKey) => {
    if (Object.prototype.hasOwnProperty.call(params, targetKey)) {
      if (Array.isArray(updatedTarget[targetKey])) {
        if (Array.isArray(params[targetKey])) {
          updatedTarget[targetKey] = params[targetKey];
        } else {
          updatedTarget[targetKey].push(params[targetKey]);
        }
      } else {
        updatedTarget[targetKey] = params[targetKey];
      }
    }
  });

  // eslint-disable-next-line consistent-return
  return updatedTarget;
};
