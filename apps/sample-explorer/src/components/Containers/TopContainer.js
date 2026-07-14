import { connect } from 'react-redux';
import TopPresentation from '../Presentations/TopPresentation';
import {
  downloadVisitedSamples,
  resetDownloadState,
  setQuerySampleTag,
  setQuerySampleClass,
  setQueryArchiveGuid,
  setQueryBarcode,
  setQueryType,
  setUrlParams,
  querySampleFromUrl,
} from '../../actions/actions';

import {
  querySample,
  querySampleClass,
  downloadSamples,
  querySupportedSampleClasses,
  querySampleFromUrlDispatch,
  querySampleTagClasses,
} from '../../util/fetchUtil';

// TODO(RJL): clean all unused state
// bind state to properties
const mapStateToProps = (state) => ({
  urlParams: state.urlParams,
  query: state.query,
  search: state.search,
  sampleUuid: state.sampleUuid,
  downloadErrorStr: state.downloadErrorStr,
  downloadIsLoading: state.downloadIsLoading,
  parentUuids: state.parentUuids,
  previousSampleUuid: state.previousSampleUuid,
  dataProducts: state.dataProducts,
  childUuids: state.childUuids,
  sampleEvents: state.sampleEvents,
  tableDefinition: state.tableDefinition,
  tableData: state.tableData,
  originalUuid: state.originalUuid,
  initialColumns: state.initialColumns,
  uuidBreadcrumbs: state.uuidBreadcrumbs,
  visitedSamples: state.visitedSamples,
  keyNodes: state.keyNodes,
  cacheControl: state.cacheControl,
  sampleClassDesc: state.sampleClassDesc,
});

// binds callback functions to action types
const mapDispatchToProps = (dispatch) => ({
  onSetUrlParams: () => {
    dispatch(setUrlParams());
  },
  onQuerySampleFromUrl: (urlParams, headers) => {
    dispatch(querySampleFromUrl());
    dispatch(querySampleFromUrlDispatch(urlParams, headers));
  },
  onSetQueryType: (queryType) => {
    dispatch(setQueryType(queryType));
  },
  onSetQuerySampleTag: (sampleTag) => {
    dispatch(setQuerySampleTag(sampleTag));
  },
  onSetQuerySampleClass: (sampleClass) => {
    dispatch(setQuerySampleClass(sampleClass));
  },
  onSetQueryArchiveGuid: (archiveGuid) => {
    dispatch(setQueryArchiveGuid(archiveGuid));
  },
  onSetQueryBarcode: (barcode) => {
    dispatch(setQueryBarcode(barcode));
  },
  onQueryClick: (url, cacheControl, headers) => {
    dispatch(querySample(url, cacheControl, headers));
  },
  onQuerySampleTagClasses: (classUrl) => {
    dispatch(querySampleTagClasses(classUrl));
  },
  onQuerySampleClassClick: (classUrl, viewUrl, cacheControl, sampleClass, headers) => {
    dispatch(querySampleClass(classUrl, viewUrl, cacheControl, sampleClass, headers));
  },
  onDownloadClick: (downloadType, url, cacheControl, headers) => {
    dispatch(downloadSamples(downloadType, url, cacheControl, headers));
  },
  onDownloadVisitedSamplesClick: (downloadType, sampleList) => {
    dispatch(downloadVisitedSamples(downloadType, sampleList));
  },
  onPopupResetClick: () => {
    dispatch(resetDownloadState());
  },
  onDownloadSupportedClassesClick: (url, fetch, download) => {
    dispatch(querySupportedSampleClasses(url, fetch, download));
  },
});

// this binds the products in the global state to the
// TopPresentation component, where they show up as
// properties
const TopContainer = connect(mapStateToProps, mapDispatchToProps)(TopPresentation);

export default TopContainer;
