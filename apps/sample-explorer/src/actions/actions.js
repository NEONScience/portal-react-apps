export const SET_URL_PARAMS = "SET_URL_PARAMS";

export const SET_QUERY_TYPE = "SET_QUERY_TYPE";
export const SET_QUERY_SAMPLE_TAG = "SET_QUERY_SAMPLE_TAG";
export const SET_QUERY_SAMPLE_CLASS = "SET_QUERY_SAMPLE_CLASS";
export const SET_QUERY_ARCHIVE_GUID = "SET_QUERY_ARCHIVE_GUID";
export const SET_QUERY_BARCODE = "SET_QUERY_BARCODE";

export const DOWNLOAD_SUCCESSFUL = "DOWNLOAD_SUCCESSFUL";
export const DOWNLOAD_RUNNING = "DOWNLOAD_RUNNING";
export const DOWNLOAD_FAILED = "DOWNLOAD_FAILED";
export const RESET_DOWNLOAD_STATE = "RESET_DOWNLOAD_STATE";
export const DOWNLOAD_VISITED_SAMPLES = "DOWNLOAD_VISITED_SAMPLES";

export const QUERY_SAMPLE_FROM_URL = "QUERY_SAMPLE_FROM_URL";

export const QUERY_SUCCESSFUL = "QUERY_SUCCESSFUL";
export const QUERY_RUNNING = "QUERY_RUNNING";
export const QUERY_FAILED = "QUERY_FAILED";

export const QUERY_SUPPORTED_CLASSES_SUCCESSFUL = "QUERY_SUPPORTED_CLASSES_SUCCESSFUL";
export const QUERY_SAMPLE_CLASS_SUCCESSFUL = "QUERY_SAMPLE_CLASS_SUCCESSFUL";

export const setUrlParams = () => {
  return {
    type: SET_URL_PARAMS
  };
}

export const querySampleFromUrl = () => {
  return {
    type: QUERY_SAMPLE_FROM_URL
  };
}

export const setQueryType = (queryType) => {
  return {
    type: SET_QUERY_TYPE,
    queryType: queryType,
  };
}

export const setQuerySampleTag = (sampleTag) => {
  return {
    type: SET_QUERY_SAMPLE_TAG,
    sampleTag: sampleTag,
  };
}

export const setQuerySampleClass = (sampleClass) => {
  return {
    type: SET_QUERY_SAMPLE_CLASS,
    sampleClass: sampleClass,
  };
}

export const setQueryArchiveGuid = (archiveGuid) => {
  return {
    type: SET_QUERY_ARCHIVE_GUID,
    archiveGuid: archiveGuid
  };
}

export const setQueryBarcode = (barcode) => {
  return {
    type: SET_QUERY_BARCODE,
    barcode: barcode
  };
}

export const downloadHasCompleted = (downloadType, json) => {
  return {
    type: DOWNLOAD_SUCCESSFUL,
    downloadType: downloadType,
    json
  };
}

export const downloadIsRunning = (bool) => {
  return {
    type: DOWNLOAD_RUNNING,
    isLoading: bool
  };
}

export const downloadVisitedSamples = (downloadType, samples) => {
  return {
    type: DOWNLOAD_VISITED_SAMPLES,
    downloadType: downloadType,
    samples: samples
  };
}

export const queryHasCompleted = (payload) => {
  return {
    type: QUERY_SUCCESSFUL,
    payload
  };
}

export const querySupportedSampleClassHasCompleted = (payload, download) => {
  return {
    type: QUERY_SUPPORTED_CLASSES_SUCCESSFUL,
    payload,
    download
  };
}

export const querySampleClassHasCompleted = (payload) => {
  return {
    type: QUERY_SAMPLE_CLASS_SUCCESSFUL,
    payload
  };
}

export const queryIsRunning = (bool) => {
  return {
    type: QUERY_RUNNING,
    isLoading: bool
  };
}

export const queryHasErrored = (error) => {
  return {
    type: QUERY_FAILED,
    hasErrored: true,
    error: error
  };
}

export const downloadHasErrored = (error) => {
  return {
    type: DOWNLOAD_FAILED,
    hasErrored: true,
    error: error
  };
}

export const resetDownloadState = () => {
  return {
    type: RESET_DOWNLOAD_STATE
  };
}
