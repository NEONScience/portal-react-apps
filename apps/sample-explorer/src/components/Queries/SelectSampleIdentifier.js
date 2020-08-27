import React from "react";
import Select from "react-select";
import Typography from "@material-ui/core/Typography";

import { exists } from "portal-core-components/lib/util/typeUtil";
import { getFullSamplesApiPath } from "../../util/envUtil";
import { getQueryTypeName } from "../../util/queryUtil";

const SelectSampleIdentifier = (props) => {
  let selectStyle = {
    outlineWidth: 0,
    borderWidth: 1,
  };
  let selected = null;
  if (exists(props.query.queryType)) {
    selected = {
      value: props.query.queryType,
      label: getQueryTypeName(props.query.queryType)
    };
  }
  return (
    <div id="select-sample-identifier">
      <Typography variant="body1">
        Choose identifier type
      </Typography>
      <div>
        <Select
          style={selectStyle}
          clearable={false}
          options={props.query.queryTypeOptions}
          value={selected}
          onChange={(selectedOption) => {
            let value = null;
            if (exists(selectedOption)) {
              value = selectedOption.value
            }
            props.action(value);
            let url = getFullSamplesApiPath() + "/supportedClasses";
            if (props.sampleClassDesc.size === 0) {
              props.onDownloadSupportedClassesClick(url, true, false);
            }
          }}
        />
      </div>
    </div>
  );
}

export default SelectSampleIdentifier;
