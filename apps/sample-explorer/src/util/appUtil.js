import NeonEnvironment from 'portal-core-components/lib/components/NeonEnvironment';
import Theme from 'portal-core-components/lib/components/Theme';

import { QUERY_TYPE } from "./queryUtil";

export const buildViewUrl = (queryType, param) => {
  let url = NeonEnvironment.getFullApiPath('samples');
  switch (queryType) {
    case QUERY_TYPE.SAMPLE_TAG:
      url = url + "/view?sampleTag=" + encodeURIComponent(param.trim());
      break;
    case QUERY_TYPE.BARCODE:
      url = url + "/view?barcode=" + encodeURIComponent(param.trim());
      break;
    case QUERY_TYPE.ARCHIVE_GUID:
      url = url + "/view?archiveGuid=" + encodeURIComponent(param.trim());
      break;
    default:
      break;
  }
  return url;
}

export const addEntry = (title, entries) => {
  for (let i = 0; i < entries.length; i++) {
    if (title === entries[i].field) {
      return false;
    }
  }
  return true;
}

export const addBreadcrumb = (uuid, uuidBreadcrumbs) => {
  if (uuidBreadcrumbs.indexOf(uuid) === -1) {
    uuidBreadcrumbs.push(uuid);
  }
}

export const checkFields = (sampleView) => {
  let sampleUuid
  let sampleClass
  let sampleTag
  let barcode
  let archiveGuid
  if (typeof sampleView.sampleUuid === "undefined" || sampleView.sampleUuid === null) {
    sampleUuid = null;
  } else {
    sampleUuid = sampleView.sampleUuid
  }

  if (typeof sampleView.sampleClass === "undefined" || sampleView.sampleClass === null) {
    sampleClass = null;
  } else {
    sampleClass = sampleView.sampleClass
  }

  if (typeof sampleView.sampleTag === "undefined" || sampleView.sampleTag === null) {
    sampleTag = null;
  } else {
    sampleTag = sampleView.sampleTag
  }

  if (typeof sampleView.barcode === "undefined" || sampleView.barcode === null) {
    barcode = null;
  } else {
    barcode = sampleView.barcode
  }

  if (typeof sampleView.archiveGuid === "undefined" || sampleView.archiveGuid === null) {
    archiveGuid = null;
  } else {
    archiveGuid = sampleView.archiveGuid;
  }

  return { uuid: sampleUuid, class: sampleClass, tag: sampleTag, barcode: barcode, archiveGuid: archiveGuid }
}

export const createEventTable = (sampleView, tableDefinition) => {

  let events = []
  if (typeof sampleView.sampleEvents !== "undefined" ||
    sampleView.sampleEvents !== null) {
    events = sampleView.sampleEvents;
  }

  let fields = [];
  for (let e = 0; e < events.length; e++) {
    if (typeof events[e].smsFieldEntries === "undefined" || events[e].smsFieldEntries === null) {
      console.log("We have an event with no SMS Field Entries.  This should not happen.")
    } else {
      for (let sms = 0; sms < events[e].smsFieldEntries.length; sms++) {
        let smsTitle = events[e].smsFieldEntries[sms].smsKey;
        if ((smsTitle !== "fate_date") && (smsTitle !== "fate_location") &&
          (smsTitle !== "fate")) {
          if (addEntry(smsTitle, fields)) {
            //let newField = { title: smsTitle, data: smsTitle }
            let newField = {
              headerName: smsTitle,
              field: smsTitle,
              sortable: true,
              resizable: true,
              filter: true
            };
            fields.push(newField);
          }
        }
      }
    }
  }

  tableDefinition = tableDefinition.concat(fields);

  //create new table rows and data
  let tableDatafromJson = [];
  for (let e = 0; e < events.length; e++) {
    let tableRow = {};
    //let tableNameEntry = {["ingestTableName"]: events[e].ingestTableName}
    let tableNameEntry = { "table": events[e].ingestTableName }
    tableRow = Object.assign(tableRow, tableNameEntry);
    for (let f = 0; f < tableDefinition.length; f++) {
      if (tableDefinition[f].field !== "table") {
        let fieldKey = tableDefinition[f].field;
        let found = false;
        if (typeof events[e].smsFieldEntries === "undefined" ||
          events[e].smsFieldEntries === null) {
          console.log("We have an event with no SMS Field Entries.  This should not happen.")
        } else {

          for (let sms = 0; sms < events[e].smsFieldEntries.length; sms++) {
            let smsTitle = events[e].smsFieldEntries[sms].smsKey;
            let smsData = events[e].smsFieldEntries[sms].smsValue;
            if (smsTitle === fieldKey) {
              if (smsData === "") {
                smsData = "n/a";
              }
              let dataEntry = { [smsTitle]: smsData };
              tableRow = Object.assign(tableRow, dataEntry);
              found = true;
              break;
            }
          }
          if (found === false) {
            let na = "n/a";
            let dataEntry = { [fieldKey]: na };
            tableRow = Object.assign(tableRow, dataEntry);
          }
        }
      }
    }

    tableDatafromJson.push(tableRow);
  }

  return { definition: tableDefinition, data: tableDatafromJson }

}

export const GRAPH_COLORS = {
  NODES: {
    FOCUS: Theme.colors.NEON_BLUE[700],
    PARENT: Theme.colors.GREEN[600],
    CHILD: Theme.colors.LIGHT_BLUE[300],
    PREVIOUS: Theme.colors.GOLD[500],
  },
  LINKS: Theme.colors.GREY[200],
};

export const createSampleGraph = (sampleView, uuidBreadcrumbs) => {
  let xF = 400
  let yF = 350
  let xIncrement = 250;
  let yRange = 400;

  let parentSamples = [];
  let childSamples = [];

  if (typeof sampleView.parentSampleIdentifiers !== "undefined" && sampleView.parentSampleIdentifiers !== null) {
    parentSamples = sampleView.parentSampleIdentifiers;
  }

  if (typeof sampleView.childSampleIdentifiers !== "undefined" && sampleView.childSampleIdentifiers !== null) {
    childSamples = sampleView.childSampleIdentifiers;
  }

  let yParentIncrement;
  let yChildIncrement;
  if (parentSamples.length === 1) {
    yParentIncrement = yRange / 4;
  } else {
    yParentIncrement = yRange / parentSamples.length;
  }

  if (childSamples.length === 1) {
    yChildIncrement = yRange / 4;
  } else {
    yChildIncrement = yRange / childSamples.length;
  }

  let nodeSize = yChildIncrement * 10;
  if (nodeSize > 250) {
    nodeSize = 250;
  }

  let newNodes = [];
  let newLinks = [];
  let centralSample = sampleView.sampleTag + "-" + sampleView.sampleClass;

  newNodes.push({
    id: sampleView.sampleUuid,
    sampleName: centralSample,
    color: GRAPH_COLORS.NODES.FOCUS,
    size: nodeSize * 3,
    x: xF,
    y: yF,
    symbolType: 'circle',
  });
  //newNodes.push({id: centralSample, nodeid: sampleUuid, fill: "red", size: nodeSize,
  //x: xF, y: yF});
  let vIdx = 1;
  let increment = yChildIncrement;
  for (let i = 0; i < childSamples.length; i++) {
    let xC = xF + xIncrement;
    increment = increment * -1;
    let yC = yF + (vIdx * increment);
    if (i % 2 === 1) {
      vIdx += 1;
    }
    let displayName = childSamples[i].sampleTag;// + "-" + childSamples[i].sampleClass;
    newNodes.push({
      id:childSamples[i].sampleUuid,
      sampleName: displayName,
      color: GRAPH_COLORS.NODES.CHILD,
      size: nodeSize,
      x: xC,
      y: yC,
      symbolType: 'triangle',
    });
    newLinks.push({ source: sampleView.sampleUuid, target: childSamples[i].sampleUuid, color: GRAPH_COLORS.LINKS });
    // newNodes.push({id: displayName, nodeid: childSamples[i].sampleUuid, fill: "green",
    //size: nodeSize, x: xC, y: yC});
    // newLinks.push({source: centralSample, target: displayName});
  }

  vIdx = 1;
  increment = yParentIncrement;
  for (let i = 0; i < parentSamples.length; i++) {
    let xP = xF - xIncrement;
    increment = increment * -1;
    let yP = yF + (vIdx * increment);
    if (i % 2 === 1) {
      vIdx += 1;
    }
    let displayName = parentSamples[i].sampleTag;// + "-" + parentSamples[i].sampleClass;
    newNodes.push({
      id: parentSamples[i].sampleUuid,
      sampleName: displayName,
      color: GRAPH_COLORS.NODES.PARENT,
      size: nodeSize,
      x: xP,
      y: yP,
      symbolType: 'square',
    });
    newLinks.push({ source: sampleView.sampleUuid, target: parentSamples[i].sampleUuid, color: GRAPH_COLORS.LINKS });
    // newNodes.push({id: displayName, nodeid: parentSamples[i].sampleUuid, fill: "blue",
    //size: nodeSize, x: xP, y: yP});
    // newLinks.push({source: centralSample, target: displayName});
  }

  //mark previous focus sample in green to keep track of it
  for (let i = 0; i < newNodes.length; i++) {
    for (let bc = 0; bc < uuidBreadcrumbs.length; bc++) {
      if ((uuidBreadcrumbs.length !== 1) && (newNodes[i].id === uuidBreadcrumbs[bc]) &&
        newNodes[i].id !== sampleView.sampleUuid) {
        newNodes[i].color = GRAPH_COLORS.NODES.PREVIOUS;
        newNodes[i].symbolType = 'diamond';
        newNodes[i].size = nodeSize - 50;
      }
    }
  }

  return { nodes: newNodes, links: newLinks }
}

export const createCsv = (samples) => {
  const { Parser } = require("json2csv");
  let headers = [
    "sampleUuid",
    "sampleClass",
    "sampleTag",
    "barcode",
    "archiveGuid",
    "parentSampleUuids",
    "childSampleUuids",
  ];
  let csvData = [];
  if (typeof samples === "undefined" || samples === null || samples.length === 0) {
    console.log("No Samples.  This should not happen.")
  } else {
    for (let i = 0; i < samples.length; i++) {

      let sampleInfoRow = [];
      sampleInfoRow = Object.assign(sampleInfoRow, { "sampleUuid": samples[i].sampleUuid });
      sampleInfoRow = Object.assign(sampleInfoRow, { "sampleClass": samples[i].sampleClass });
      sampleInfoRow = Object.assign(sampleInfoRow, { "sampleTag": samples[i].sampleTag });

      if (typeof samples[i].barcode === "undefined" || samples[i].barcode === null) {
        sampleInfoRow = Object.assign(sampleInfoRow, { "barcode": "" });
      } else {
        sampleInfoRow = Object.assign(sampleInfoRow, { "barcode": samples[i].barcode });
      }

      if (typeof samples[i].archiveGuid === "undefined" || samples[i].archiveGuid === null) {
        sampleInfoRow = Object.assign(sampleInfoRow, { "archiveGuid": "" });
      } else {
        sampleInfoRow = Object.assign(sampleInfoRow, { "archiveGuid": samples[i].archiveGuid });
      }

      //handle parent samples
      if (typeof samples[i].parentSampleIdentifiers === "undefined" ||
        samples[i].parentSampleIdentifiers === null) {
        sampleInfoRow = Object.assign(sampleInfoRow, { "parentSampleUuids": "" });
      } else {
        let parentSamples = samples[i].parentSampleIdentifiers;
        let parentUuids = []
        for (let p = 0; p < parentSamples.length; p++) {
          parentUuids.push(parentSamples[p].sampleUuid)
        }

        let parentStr = parentUuids.join(" ; ");

        let parentEntry = { "parentSampleUuids": parentStr };

        sampleInfoRow = Object.assign(sampleInfoRow, parentEntry);
      }

      //handle child samples
      if (typeof samples[i].childSampleIdentifiers === "undefined" || samples[i].childSampleIdentifiers === null) {
        sampleInfoRow = Object.assign(sampleInfoRow, { "childSampleUuids": "" });
      } else {
        let childSamples = samples[i].childSampleIdentifiers;
        let childUuids = []
        for (let p = 0; p < childSamples.length; p++) {
          childUuids.push(childSamples[p].sampleUuid)
        }

        let childStr = childUuids.join(" ; ");

        let childEntry = { "childSampleUuids": childStr };

        sampleInfoRow = Object.assign(sampleInfoRow, childEntry);
      }
      //handle sample events
      if (typeof samples[i].sampleEvents === "undefined" || samples[i].sampleEvents === null) {
        csvData.push(sampleInfoRow);
      } else {
        let events = samples[i].sampleEvents;
        for (let e = 0; e < events.length; e++) {
          if (typeof events[e].smsFieldEntries === "undefined" || events[e].smsFieldEntries === null) {
            console.log("We have an event with no SMS Field Entries.  This should not happen.")
          } else {
            for (let sms = 0; sms < events[e].smsFieldEntries.length; sms++) {
              let field = events[e].smsFieldEntries[sms].smsKey;
              if (!(headers.indexOf(field) > -1)) {
                headers.push(field);
              }
              let fieldData = events[e].smsFieldEntries[sms].smsValue;
              let csvEntry = { [field]: fieldData };
              sampleInfoRow = Object.assign(sampleInfoRow, csvEntry);

            }
            csvData.push(sampleInfoRow);
          }
        }
      }
    }
  }

  let jsonParser = new Parser({ fields: headers });
  let csvResult = jsonParser.parse(csvData);

  return csvResult;
}
