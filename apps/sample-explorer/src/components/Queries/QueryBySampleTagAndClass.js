import React, { Component } from "react";
import Typography from "@material-ui/core/Typography";
import Select from "react-select";
import { getFullSamplesApiPath } from "../../util/envUtil";
import { exists } from "portal-core-components/lib/util/typeUtil";

class QueryBySampleTagAndClass extends Component {
  createSampleClassOption(sampleClass) {
    return { value: sampleClass, label: sampleClass };
  }

  render() {
    var sampleClasses = this.props.query.sampleClasses
    var sampleClassesList = [];
    if (sampleClasses.length !== 0) {
      sampleClassesList = sampleClasses.map(this.createSampleClassOption);
    }

    let selectedValue = null;
    if (exists(this.props.sampleClass)) {
      selectedValue = this.createSampleClassOption(this.props.sampleClass);
    }

    return (
      <div id="select-sample-identifier">
        <Typography variant="body1">
          Choose Sample Class
        </Typography>
        <div>
          <Select
            multi={false}
            clearable={false}
            options={sampleClassesList}
            value={selectedValue}
            onChange={(selectedOption) => {
              let value = null
              if ((typeof selectedOption !== "undefined")
                && (selectedOption !== null)) {
                value = selectedOption.value
              }
              this.props.onSetQuerySampleClass(value);
              let appliedSampleTag = "";
              if (exists(this.props.sampleTag)) {
                appliedSampleTag = this.props.sampleTag.trim();
              }
              let url = getFullSamplesApiPath() + "/view?sampleTag="
                + encodeURIComponent(appliedSampleTag) +
                "&sampleClass=" + encodeURIComponent(value)
              console.log("Query by Sample Tag and Sample Class")
              console.log("URL: " + url)
              this.props.onQueryClick(url, this.props.cacheControl)
            }}
          />
        </div>
      </div>
    )
  }
}

export default QueryBySampleTagAndClass;
