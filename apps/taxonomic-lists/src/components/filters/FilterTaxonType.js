import React, { Component } from "react";

import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

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
    return (
      <Select
        variant="outlined"
        value={this.props.selectedValue}
        onChange={event => this.props.onFilterValueChanged(FILTER_PROP, event.target.value)}
        style={{ minWidth: '180px' }}
        SelectDisplayProps={{ style: { padding: '10.5px 16px' }}}
        aria-labelledby="taxon-type-title"
        data-selenium="select-taxon-type"
      >
        {this.props.taxonTypes.map((taxonType) => {
          return (
            <MenuItem key={taxonType.value} value={taxonType.value}>
              {taxonType.label}
            </MenuItem>
          );
        })}
      </Select>
    );
  }
}

export default FilterTaxonType;
