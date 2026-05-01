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

export const setUrlParams = () => ({
  type: SET_URL_PARAMS,
});

export const querySampleFromUrl = () => ({
  type: QUERY_SAMPLE_FROM_URL,
});

export const setQueryType = (queryType) => ({
  type: SET_QUERY_TYPE,
  queryType,
});

export const setQuerySampleTag = (sampleTag) => ({
  type: SET_QUERY_SAMPLE_TAG,
  sampleTag,
});

export const setQuerySampleClass = (sampleClass) => ({
  type: SET_QUERY_SAMPLE_CLASS,
  sampleClass,
});

export const setQueryArchiveGuid = (archiveGuid) => ({
  type: SET_QUERY_ARCHIVE_GUID,
  archiveGuid,
});

export const setQueryBarcode = (barcode) => ({
  type: SET_QUERY_BARCODE,
  barcode,
});

export const downloadHasCompleted = (downloadType, json) => ({
  type: DOWNLOAD_SUCCESSFUL,
  downloadType,
  json,
});

export const downloadIsRunning = (bool) => ({
  type: DOWNLOAD_RUNNING,
  isLoading: bool,
});

export const downloadVisitedSamples = (downloadType, samples) => ({
  type: DOWNLOAD_VISITED_SAMPLES,
  downloadType,
  samples,
});

export const queryHasCompleted = (payload) => ({
  type: QUERY_SUCCESSFUL,
  payload,
});

export const querySupportedSampleClassHasCompleted = (payload, download) => ({
  type: QUERY_SUPPORTED_CLASSES_SUCCESSFUL,
  payload,
  download,
});

export const querySampleClassHasCompleted = (payload) => ({
  type: QUERY_SAMPLE_CLASS_SUCCESSFUL,
  payload,
});

// Only for MAIN query, not any queries around, for example, supported sample classes
export const queryIsRunning = () => ({
  type: QUERY_RUNNING,
});

export const queryHasErrored = (error) => ({
  type: QUERY_FAILED,
  hasErrored: true,
  error,
});

export const downloadHasErrored = (error) => ({
  type: DOWNLOAD_FAILED,
  hasErrored: true,
  error,
});

export const resetDownloadState = () => ({
  type: RESET_DOWNLOAD_STATE,
});
