import { SAMPLE_ID_LIST_EXCEPTION_MESSAGE } from "../util/constants";
import {
  SET_QUERY_SAMPLE_TAG,
  SET_QUERY_SAMPLE_CLASS,
  SET_QUERY_TYPE,
  SET_URL_PARAMS,
  SET_QUERY_ARCHIVE_GUID,
  SET_QUERY_BARCODE,
  QUERY_FAILED,
  QUERY_RUNNING,
  DOWNLOAD_VISITED_SAMPLES,
  QUERY_SAMPLE_CLASS_SUCCESSFUL,
  QUERY_SUPPORTED_CLASSES_SUCCESSFUL,
  DOWNLOAD_RUNNING,
  DOWNLOAD_SUCCESSFUL,
  RESET_DOWNLOAD_STATE,
  DOWNLOAD_FAILED,
  QUERY_SUCCESSFUL,
  QUERY_SAMPLE_FROM_URL,
} from "../actions/actions";

import {
  createCsv,
  checkFields,
  addBreadcrumb,
  createSampleGraph,
  createEventTable,
} from "../util/appUtil";
import { parseParams, applyParams, hasParams } from "../util/paramUtil";
import { detectIdTypeParam, validateParamQuery } from "../util/queryUtil";

const fileDownload = require("js-file-download");
const { Parser } = require("json2csv");

const reducer = (state = {}, action) => {
  let update;
  switch (action.type) {
    case SET_URL_PARAMS:
      if (!hasParams()) {
        return {
          ...state,
          urlParams: {
            ...state.urlParams,
            parsed: true,
            fetch: false,
          }
        };
      }
      let params = [
        "idType",
        "sampleTag",
        "sampleClass",
        "archiveGuid",
        "barcode"
      ];
      let urlParamsUpdate = {
        ...state.urlParams,
        parsed: true,
      };
      urlParamsUpdate = detectIdTypeParam(applyParams(urlParamsUpdate, parseParams(params)));
      urlParamsUpdate.fetch = validateParamQuery(urlParamsUpdate);
      update = {
        ...state,
        urlParams: urlParamsUpdate
      };
      return update;

    case QUERY_SAMPLE_FROM_URL:
      return {
        ...state,
        urlParams: {
          ...state.urlParams,
          fetch: false,
        },
        query: {
          ...state.query,
          queryType: state.urlParams.idType,
          sampleTag: state.urlParams.sampleTag,
          sampleClass: state.urlParams.sampleClass,
          archiveGuid: state.urlParams.archiveGuid,
          barcode: state.urlParams.barcode,
        }
      };

    case SET_QUERY_TYPE:
      update = {
        ...state,
        query: {
          ...state.query,
          queryType: action.queryType,
        }
      };
      return update;

    case SET_QUERY_SAMPLE_TAG:
      update = {
        ...state,
        query: {
          ...state.query,
          sampleTag: action.sampleTag,
        }
      };
      return update;

    case SET_QUERY_SAMPLE_CLASS:
      update = {
        ...state,
        query: {
          ...state.query,
          sampleClass: action.sampleClass,
        }
      };
      return update;

    case SET_QUERY_ARCHIVE_GUID:
      update = {
        ...state,
        query: {
          ...state.query,
          archiveGuid: action.archiveGuid,
        }
      };
      return update;

    case SET_QUERY_BARCODE:
      update = {
        ...state,
        query: {
          ...state.query,
          barcode: action.barcode,
        }
      };
      return update;

    case QUERY_FAILED:
      var errorString = action.error
      var errorDisplay

      if (errorString.includes("400")) {
        errorDisplay = "Bad Request. Make sure you have entered the required fields..."
      } else if (errorString.includes("404")) {
        if (errorString.includes("Sample Class is not supported")) {
          errorDisplay = "Currently this Sample Class is not supported..."
        } else {
          errorDisplay = "Sample Not Found. You may have entered an incorrect identifier..."
        }

      } else if (errorString.includes("500")) {
        errorDisplay = "Internal Server Error. Contact NEON CI Staff..."
      } else if (errorString === SAMPLE_ID_LIST_EXCEPTION_MESSAGE) {
        errorDisplay = errorString;
      } else {
        errorDisplay = "Internal Server Error. Contact NEON CI Staff..."
      }

      let visitedSamples = {
        sampleUuids: [],
        sampleViews: [],
      }

      update = {
        ...state,
        query: {
          ...state.query,
          queryIsLoading: false,
          queryErrorStr: errorDisplay,
        },
        sampleUuid: "",
        previousSampleUuid: "",
        visitedSamples: visitedSamples,
        cacheControl: ""
      }
      return update;

    case QUERY_RUNNING:
      update = {
        ...state,
        query: {
          ...state.query,
          queryIsLoading: true,
        }
      }
      return update;

    case DOWNLOAD_VISITED_SAMPLES:
      var visitedSamplesJson = JSON.stringify(action.samples);
      var file = "neon-samples";
      if (action.samples.length === 1) {
        file = action.samples[0].sampleTag + "-" + action.samples[0].sampleClass
      }
      var fileType = action.downloadType;
      switch (fileType) {
        case "json":
          fileDownload(visitedSamplesJson, file + ".json");
          break;
        case "csv":
          var csv = createCsv(action.samples);
          fileDownload(csv, file + ".csv");
          break;
        default:
          break;
      }
      return state;

    case QUERY_SUPPORTED_CLASSES_SUCCESSFUL:
      let sampleClasses;
      //if action.payload is null then we didn't have to fetch, the classes are already in state.
      if (action.payload === null) {
        sampleClasses = state.sampleClassDesc;
      } else {
        var sampleClassArr = action.payload.data.entries
        sampleClasses = new Map();
        for (let i = 0; i < sampleClassArr.length; i++) {
          sampleClasses.set(sampleClassArr[i].key, sampleClassArr[i].value)
        }
      }

      let headers = ["Sample Class", "Description"]
      let csvData = [];
      for (var [key, value] of sampleClasses) {
        let row = [];
        row = Object.assign(row, { "Sample Class": key });
        row = Object.assign(row, { "Description": value });
        csvData.push(row);
      }

      if (action.download) {
        let jsonParser = new Parser({ fields: headers });
        let csvResult = jsonParser.parse(csvData);
        fileDownload(csvResult, "Supported_Sample_Classes.csv");
      }

      update = {
        ...state,
        sampleClassDesc: sampleClasses
      }
      return update;

    case QUERY_SAMPLE_CLASS_SUCCESSFUL:
      var classes = action.payload.data.sampleClasses;
      update = {
        ...state,
        query: {
          ...state.query,
          queryIsLoading: false,
          sampleClasses: classes
        }
      }
      return update;

    case DOWNLOAD_SUCCESSFUL:
      var downloadJson = JSON.stringify(action.json.data);
      var fileName = "neon-samples";
      switch (action.downloadType) {
        case "json":
          fileDownload(downloadJson, fileName + ".json");
          break;
        case "csv":
          csv = createCsv(action.json.data.sampleViews);
          fileDownload(csv, fileName + ".csv");
          break;
        default:
          break;
      }
      update = {
        ...state,
        downloadErrorStr: "",
        cacheControl: ""
      }
      return update;

    case DOWNLOAD_RUNNING:
      update = {
        ...state,
        downloadIsLoading: action.isLoading
      }
      return update;

    case RESET_DOWNLOAD_STATE:
      update = {
        ...state,
        downloadErrorStr: ""
      }
      return update;

    case DOWNLOAD_FAILED:
      errorString = action.error
      if (errorString.includes("400")) {
        errorDisplay = "Bad Request. Make sure you have entered the required fields..."
      } else if (errorString.includes("Degree of Sample Network search required.")) {
        errorDisplay = "Degree of Sample Network search required.  1 - n"
      } else if (errorString.includes("404")) {
        if (errorString.includes("Sample Class is not supported")) {
          errorDisplay = "Currently this Sample Class is not supported..."
        } else {
          errorDisplay = "Sample Not Found. You may have entered an incorrect identifier..."
        }

      } else if (errorString.includes("500")) {
        errorDisplay = "Internal Server Error. Contact NEON CI Staff..."
      } else if (errorString === SAMPLE_ID_LIST_EXCEPTION_MESSAGE) {
        errorDisplay = errorString;
      } else {
        errorDisplay = "Internal Server Error. Contact NEON CI Staff..."
      }

      update = {
        ...state,
        downloadErrorStr: errorDisplay,
        cacheControl: ""
      }
      return update;

    case QUERY_SUCCESSFUL:
      let data = action.payload.data;
      //TODO: more than one match to sample query...
      if (typeof data.sampleViews === "undefined" || data.sampleViews === null) {
        console.log("No Sample Views.  This should not happen.")
      } else {
        for (let i = 0; i < data.sampleViews.length; i++) {

          let fieldDatum = checkFields(data.sampleViews[i])
          let sampleUuid = fieldDatum.uuid;
          let sampleClass = fieldDatum.class;
          let sampleTag = fieldDatum.tag;
          let barcode = fieldDatum.barcode;
          let archiveGuid = fieldDatum.archiveGuid;
          let previousSampleUuid = state.previousSampleUuid;
          let visitedSamples = state.visitedSamples;

          if (visitedSamples.sampleUuids.indexOf(sampleUuid) === -1) {
            visitedSamples.sampleUuids.push(sampleUuid);
            visitedSamples.sampleViews.push(data.sampleViews[i]);
          }

          //check to make sure this is a new query.  if not new just return the existing information
          if (sampleUuid === previousSampleUuid) {
            update = {
              ...state,
              visitedSamples: visitedSamples
            }
            return update;
          } else {
            previousSampleUuid = sampleUuid;
          }

          let uuidBreadcrumbs = state.uuidBreadcrumbs;
          //remove sample from bread crumb
          if (uuidBreadcrumbs.length > 1) {
            if (uuidBreadcrumbs[uuidBreadcrumbs.length - 2] === sampleUuid) {
              uuidBreadcrumbs.pop();
            } else {
              addBreadcrumb(sampleUuid, uuidBreadcrumbs);
            }
          } else {
            addBreadcrumb(sampleUuid, uuidBreadcrumbs);
          }

          //create Sample Graph nodes and links
          let graphStuff = createSampleGraph(data.sampleViews[i], uuidBreadcrumbs)
          let newNodes = graphStuff.nodes;
          let newLinks = graphStuff.links;

          //create DataTable definition
          let tableStuff = createEventTable(data.sampleViews[i], state.initialColumns);
          let tableDefinition = tableStuff.definition;
          let tableData = tableStuff.data;

          update = {
            ...state,
            query: {
              ...state.query,
              queryIsLoading: false,
              queryErrorStr: "success",
              sampleClass: sampleClass,
            },
            search: {
              sampleClass: sampleClass,
              sampleTag: sampleTag,
              barcode: barcode,
              archiveGuid: archiveGuid,
            },
            sampleUuid: sampleUuid,
            previousSampleUuid: previousSampleUuid,
            dataProducts: data.sampleViews[i].dataProducts,
            parentUuids: data.sampleViews[i].parentUuids,
            childUuids: data.sampleViews[i].childUuids,
            sampleEvents: data.sampleViews[i].sampleEvents,
            tableDefinition: tableDefinition,
            tableData: tableData,
            uuidBreadcrumbs: uuidBreadcrumbs,
            visitedSamples: visitedSamples,
            cacheControl: "",
            graphData: {
              nodes: newNodes,
              links: newLinks,
            }
          }
        }
      }
      return update;
    default:
      return state;
  }
}

export default reducer;
