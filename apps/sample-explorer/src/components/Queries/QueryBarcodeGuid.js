import React from "react";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import { exists } from "portal-core-components/lib/util/typeUtil";
import { getQueryTypeName, QUERY_TYPE } from "../../util/queryUtil";

import "./Query.css";

const QueryBarcodeGuid = (props) => {
  let inputStyle = {
    outlineWidth: 0,
    borderWidth: 1,
    height: 38,
    width: "100%",
    marginRight: "10px",
    marginTop: "0px"
  };

  let currentValue = "";
  switch (props.queryType) {
    case QUERY_TYPE.ARCHIVE_GUID:
      currentValue = exists(props.query.archiveGuid) ? props.query.archiveGuid : "";
      break;
    case QUERY_TYPE.BARCODE:
      currentValue = exists(props.query.barcode) ? props.query.barcode : "";
      break;
    default:
      break;
  }

  return (
    <div id="sample-query-barcode-guid" >
      <Typography variant="body1">
        Enter {getQueryTypeName(props.queryType)}
      </Typography>
      <div>
        <TextField
          style={inputStyle}
          autoComplete="on"
          value={currentValue}
          margin="normal"
          variant="outlined"
          onChange={(e) => {
            switch (props.queryType) {
              case QUERY_TYPE.ARCHIVE_GUID:
                props.onSetQueryArchiveGuid(e.currentTarget.value);
                break;
              case QUERY_TYPE.BARCODE:
                props.onSetQueryBarcode(e.currentTarget.value);
                break;
              default:
                break;
            }
          }}
        />
      </div>
    </div>
  );
}

export default QueryBarcodeGuid;
