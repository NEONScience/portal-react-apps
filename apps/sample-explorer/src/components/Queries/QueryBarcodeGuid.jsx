import React from "react";
import PropTypes from 'prop-types';

import TextField from "@mui/material/TextField";

import { getQueryTypeName, QUERY_TYPE } from "../../util/queryUtil";

function QueryBarcodeGuid(props) {
  const {
    query: {
      queryType,
      barcode,
      archiveGuid,
      queryIsLoading,
    },
    onSetQueryBarcode,
    onSetQueryArchiveGuid,
  } = props;

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
      disabled={queryIsLoading}
      data-gtm="sample-search-form.sample-identifier"
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
}

QueryBarcodeGuid.propTypes = {
  query: PropTypes.shape({
    queryType: PropTypes.string.isRequired,
    barcode: PropTypes.string,
    archiveGuid: PropTypes.string,
    queryIsLoading: PropTypes.bool,
  }).isRequired,
  onSetQueryBarcode: PropTypes.func.isRequired,
  onSetQueryArchiveGuid: PropTypes.func.isRequired,
};

export default QueryBarcodeGuid;
