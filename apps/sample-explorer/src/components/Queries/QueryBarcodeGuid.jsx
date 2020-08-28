import React from "react";

import TextField from "@material-ui/core/TextField";

import { getQueryTypeName, QUERY_TYPE } from "../../util/queryUtil";

const QueryBarcodeGuid = (props) => {

  const {
    query: {
      queryType,
      barcode,
      archiveGuid,
    },
    onSetQueryBarcode,
    onSetQueryArchiveGuid,
  } = props;

  console.log(queryType);
  let currentValue = '';
  switch (queryType) {
    case QUERY_TYPE.ARCHIVE_GUID:
      currentValue = archiveGuid || '';
      break;
    case QUERY_TYPE.BARCODE:
      currentValue = barcode || '';
      break;
    default:
      break;
  }

  return (
    <TextField
      label={getQueryTypeName(queryType)}
      autoComplete="on"
      value={currentValue}
      variant="outlined"
      style={{ minWidth: '240px' }}
      data-selenium="sample-search-form.barcode-guid"
      onChange={(e) => {
        switch (queryType) {
          case QUERY_TYPE.ARCHIVE_GUID:
            onSetQueryArchiveGuid(e.currentTarget.value);
            break;
          case QUERY_TYPE.BARCODE:
            onSetQueryBarcode(e.currentTarget.value);
            break;
          default:
            break;
        }
      }}
    />
  );
};

export default QueryBarcodeGuid;
