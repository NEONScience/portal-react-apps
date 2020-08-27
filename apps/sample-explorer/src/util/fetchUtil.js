import { handleError } from "./actionUtil";
import { fetch as fetchPolyfill } from "whatwg-fetch";

import NeonApi from "portal-core-components/lib/components/NeonApi";
import { exists } from "portal-core-components/lib/util/typeUtil";

import {
  queryIsRunning,
  queryHasCompleted,
  queryHasErrored,
  querySampleClassHasCompleted,
  querySupportedSampleClassHasCompleted,
  downloadIsRunning,
  downloadHasCompleted,
  downloadHasErrored
} from "../actions/actions";
import { buildViewUrl } from "./appUtil";
import { QUERY_TYPE } from "./queryUtil";
import { getFullSamplesApiPath } from "./envUtil";

const checkStatus = (response) => {
  if (typeof response === "undefined") {
    let error = new Error("Error occurred");
    error.response = null;
    throw error;
  }
  if (response.status >= 200 && response.status < 300) {
    return response;
  } else {
    let error = new Error(response.statusText);
    error.response = response;
    throw error;
  }
}

const getFetch = () => {
  let fetchFunc = fetch;
  if (typeof fetchFunc === "undefined") {
    fetchFunc = fetchPolyfill;
  }
  return fetchFunc;
}

export const querySampleFromUrlDispatch = (urlParams) => {
  let viewUrl = null;
  switch (urlParams.idType) {
    case QUERY_TYPE.SAMPLE_TAG:
      let url = getFullSamplesApiPath();
      let classUrl = url + "/classes?sampleTag=" + encodeURIComponent(urlParams.sampleTag.trim());
      viewUrl = buildViewUrl(QUERY_TYPE.SAMPLE_TAG, urlParams.sampleTag);
      return querySampleClass(classUrl, viewUrl, null, urlParams.sampleClass);
    case QUERY_TYPE.BARCODE:
      viewUrl = buildViewUrl(QUERY_TYPE.BARCODE, urlParams.barcode);
      return querySample(viewUrl);
    case QUERY_TYPE.ARCHIVE_GUID:
      viewUrl = buildViewUrl(QUERY_TYPE.ARCHIVE_GUID, urlParams.archiveGuid);
      return querySample(viewUrl);
    default:
      break;
  }
  return;
}

export const querySample = (url, cacheControl) => {
  let fetchHeaders = {
    Accept: "application/json;charset=UTF-8; text/plain",
    ...NeonApi.getApiTokenHeader(),
  };
  if (cacheControl === "no-cache") {
    fetchHeaders["cache-control"] = cacheControl;
  }
  const fetchInit = {
    method: "GET",
    headers: fetchHeaders,
    mode: "cors",
    cache: "default",
  };

  let fetchFunc = getFetch();

  return (dispatch) => {
    dispatch(queryIsRunning(true));
    fetchFunc(url, fetchInit)
      .then(checkStatus)
      .then((response) => {
        if (!response.ok) {
          var error = new Error(response.statusText)
          error.response = response
          throw error
        }
        dispatch(queryIsRunning(false));
        return response;
      })
      .then((response) => response.json())
      .then((json) => dispatch(queryHasCompleted(json)))
      .catch((error) => {
        if (typeof error === "undefined" || typeof error.response === "undefined" || error.response === null) {
          dispatch(queryHasErrored("500"));
        } else {
          handleError(dispatch, queryHasErrored, error);
        }
      })
  };
}

export const querySampleTagClasses = (classUrl) => {
  let fetchHeaders = {
    Accept: "application/json;charset=UTF-8; text/plain",
    ...NeonApi.getApiTokenHeader(),
  };
  const fetchInit = {
    method: "GET",
    headers: fetchHeaders,
    mode: "cors",
    cache: "default",
  };

  let fetchFunc = getFetch();
  return (dispatch) => {
    fetchFunc(classUrl, fetchInit)
      .then(checkStatus)
      .then((response) => {
        if (!response.ok) {
          var error = new Error(response.statusText)
          error.response = response
          throw error
        }
        return response;
      })
      .then((response) => response.json())
      .then((json) => {
        dispatch(querySampleClassHasCompleted(json));
      })
      .catch((error) => {
        if (typeof error === "undefined"
            || typeof error.response === "undefined"
            || error.response === null) {
          dispatch(queryHasErrored("500"));
        } else {
          handleError(dispatch, queryHasErrored, error);
        }
      })
  };
}

export const querySampleClass = (classUrl, viewUrl, cacheControl, sampleClass) => {
  let fetchHeaders = {
    Accept: "application/json;charset=UTF-8; text/plain",
    ...NeonApi.getApiTokenHeader(),
  };
  if (cacheControl === "no-cache") {
    fetchHeaders["cache-control"] = cacheControl;
  }
  const fetchInit = {
    method: "GET",
    headers: fetchHeaders,
    mode: "cors",
    cache: "default",
  }

  let fetchFunc = getFetch();

  return (dispatch) => {
    dispatch(queryIsRunning(true));
    fetchFunc(classUrl, fetchInit)
      .then(checkStatus)
      .then((response) => {
        if (!response.ok) {
          var error = new Error(response.statusText)
          error.response = response
          throw error
        }
        dispatch(queryIsRunning(false));
        return response;
      })
      .then((response) => response.json())
      .then((json) => {
        dispatch(querySampleClassHasCompleted(json));
        return json;
      })
      .then((json) => {
        let appliedSampleClass = null;
        if (exists(sampleClass) && (json.data.sampleClasses.indexOf(sampleClass) > 0)) {
          appliedSampleClass = sampleClass;
        } else if (json.data.sampleClasses.length > 0) {
          appliedSampleClass = json.data.sampleClasses[0];
        }

        if (exists(appliedSampleClass)) {
          viewUrl = viewUrl + "&sampleClass=" + appliedSampleClass;
          dispatch(querySample(viewUrl, cacheControl));
        }
      })
      .catch((error) => {
        if (typeof error === "undefined"
            || typeof error.response === "undefined"
            || error.response === null) {
          dispatch(queryHasErrored("500"));
        } else {
          handleError(dispatch, queryHasErrored, error);
        }
      })
  };
}

export const querySupportedSampleClasses = (url, query, download) => {
  const fetchInit = {
    method: "GET",
    headers: {
      Accept: "application/json;charset=UTF-8; text/plain",
      ...NeonApi.getApiTokenHeader()
    },
    mode: "cors",
    cache: "default",
  }

  //do we need to perform a fetch?
  if (query) {
    let fetchFunc = getFetch();
    return (dispatch) => {
      dispatch(queryIsRunning(true));
      fetchFunc(url, fetchInit)
        .then(checkStatus)
        .then((response) => {
          if (!response.ok) {
            var error = new Error(response.statusText)
            error.response = response
            throw error
          }
          dispatch(queryIsRunning(false));
          return response;
        })
        .then((response) => response.json())
        .then((json) => dispatch(querySupportedSampleClassHasCompleted(json, download)))
        .catch((error) => {
          if (typeof error === "undefined" || typeof error.response === "undefined" || error.response === null) {
            dispatch(queryHasErrored("500"));
          } else {
            handleError(dispatch, queryHasErrored, error);
          }
        })
    };
  } else {
    return (dispatch) => {
      dispatch(querySupportedSampleClassHasCompleted(null, download));
    }
  }

}

export const downloadSamples = (downloadType, url, cacheControl) => {
  const fetchHeaders = new Headers();
  fetchHeaders.append("Accept", "application/json;charset=UTF-8");
  fetchHeaders.append("Accept", "text/plain");
  if (cacheControl === "no-cache") {
    fetchHeaders.append("cache-control", cacheControl);
  }
  const fetchInit = {
    method: "GET",
    headers: {
      ...fetchHeaders,
      ...NeonApi.getApiTokenHeader(),
    },
    mode: "cors",
    cache: "default",
  }

  let fetchFunc = getFetch();

  return (dispatch) => {
    dispatch(downloadIsRunning(true));
    fetchFunc(url, fetchInit)
      .then(checkStatus)
      .then((response) => {
        if (!response.ok) {
          var error = new Error(response.statusText)
          error.response = response
          throw error
        }
        dispatch(downloadIsRunning(false));
        return response;
      })
      .then((response) => response.json())
      .then((json) => dispatch(downloadHasCompleted(downloadType, json)))
      .catch((error) => {
        if (typeof error === "undefined" || typeof error.response === "undefined" || error.response === null) {
          dispatch(downloadHasErrored("500"));
        } else {
          handleError(dispatch, downloadHasErrored, error);
        }
      })
  };
}
