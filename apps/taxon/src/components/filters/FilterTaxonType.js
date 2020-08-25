import React, { Component } from "react";

import Select from "react-select";
import Typography from '@material-ui/core/Typography';

import { taxonTypes } from "../../api/taxonTypes";

class FilterTaxonType extends Component {
  constructor(props) {
    super(props);

    this.setTaxonTypes = this.setTaxonTypes.bind(this);
  }

  componentDidMount() {
    this.setTaxonTypes(taxonTypes);
  }

  setTaxonTypes(taxonTypes) {
    if (this.props.onSetTaxonTypes) {
      this.props.onSetTaxonTypes(taxonTypes);
    }
  }

  render() {
    const FILTER_PROP = "taxonTypeCode";

    const inputStyle = {
      width: 250,
      paddingTop: 5,
      paddingBottom: 10,
      textAlign: "left",
    }

    const selectedOption = {
      label: this.props.selectedValue,
      value: this.props.selectedValue,
    }

    return (
      <div>
        <Typography variant="h5" style={{ marginBottom: '8px' }}>Taxon Type</Typography>
        <div style={inputStyle}>
          <Select
            isSearchable
            clearable={false}
            name="form-field-name"
            options={this.props.taxonTypes}
            value={selectedOption}
            onChange={(selectedOption) => {
              let value = null
              if ((typeof selectedOption !== "undefined")
                  && (selectedOption !== null)) {
                value = selectedOption.value
              }
              return this.props.onFilterValueChanged(FILTER_PROP, value)
            }}
          />
        </div>
      </div>
    );
  }
}

export default FilterTaxonType;
