import { exists } from "portal-core-components/lib/util/typeUtil";

export const QUERY_TYPE = {
  UNSET: "unset",
  SAMPLE_TAG: "sampleTag",
  ARCHIVE_GUID: "archiveGuid",
  BARCODE: "barcode"
};

export const getQueryTypeName = (queryType) => {
  switch (queryType) {
    case QUERY_TYPE.ARCHIVE_GUID:
      return "Archive Guid";
    case QUERY_TYPE.BARCODE:
      return "Barcode";
    case QUERY_TYPE.SAMPLE_TAG:
    default:
      return "Sample Tag";
  }
}

export const getQueryTypeNames = () => {
  return [
    getQueryTypeName(QUERY_TYPE.SAMPLE_TAG),
    getQueryTypeName(QUERY_TYPE.ARCHIVE_GUID),
    getQueryTypeName(QUERY_TYPE.BARCODE)
  ];
}

export const getQueryTypeNameOptions = () => {
  return [
    { value: QUERY_TYPE.SAMPLE_TAG, label: getQueryTypeName(QUERY_TYPE.SAMPLE_TAG) },
    { value: QUERY_TYPE.ARCHIVE_GUID, label: getQueryTypeName(QUERY_TYPE.ARCHIVE_GUID) },
    { value: QUERY_TYPE.BARCODE, label: getQueryTypeName(QUERY_TYPE.BARCODE) },
  ];
}

export const validateParamQuery = (params) => {
  if (!exists(params)) {
    return false;
  }

  switch (params.idType) {
    case QUERY_TYPE.ARCHIVE_GUID:
      if (!exists(params.archiveGuid) || Array.isArray(params.archiveGuid)) {
        return false;
      }
      return true;
    case QUERY_TYPE.BARCODE:
      if (!exists(params.barcode) || Array.isArray(params.barcode)) {
        return false;
      }
      return true;
    case QUERY_TYPE.SAMPLE_TAG:
      if (!exists(params.sampleTag) || Array.isArray(params.sampleTag)) {
        return false;
      }
      return true;
    default:
      return false;
  }
}
