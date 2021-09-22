import React, { Component } from "react";

import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

import DataProductLinks from "./DataProductLinks";

import { taxonTypes } from "../../api/taxonTypes";
// import { getTaxonTypeDataProductsApiPath } from '../../api/taxon';

class FilterTaxonType extends Component {

  constructor(props) {
    super(props);
    this.setTaxonTypes = this.setTaxonTypes.bind(this);
    this.taxonTypeCode = 'ALGAE';
    this.state = { responseData: [] };
  }

  componentDidMount() {
    this.setTaxonTypes(taxonTypes);
    let data = this.getDataProducts(this.taxonTypeCode);
    this.setState({ responseData: data });
  }

  setTaxonTypes(types) {
    if (this.props.onSetTaxonTypes) {
      this.props.onSetTaxonTypes(types);
    }
  }

  getDataProducts(taxonTypeCode) {
    // const url = getTaxonTypeDataProductsApiPath();
    const url = 'http://localhost:8888/api/v0/taxonomy/products';
    const fullUrl = `${url}/${taxonTypeCode}`;
    const headers = { 'Content-Type': 'application/json;charset=UTF-8' };
    fetch(fullUrl, { headers })
      .then((res) => {
        if (!res.ok) {
          throw new Error(res.statusText);
        }
        return res.json();
      })
      .then((json) => {
        this.setState({ responseData: json });
      })
      .catch((error) => {
        console.log(`Could not retrieve data products from fetch: ${error.message}.`);
      });
  }

  render() {
    const FILTER_PROP = "taxonTypeCode";
    return (
      <>
        <Select
          variant="outlined"
          value={this.props.selectedValue}
          onChange={event => {
            this.props.onFilterValueChanged(FILTER_PROP, event.target.value);
            this.taxonTypeCode = event.target.value;
            this.data = this.getDataProducts(this.taxonTypeCode);
          }}
          style={{ minWidth: '250px', marginBottom: '16px' }}
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
        {(this.state?.responseData?.data?.dataProducts) ?
          <DataProductLinks props={this.state?.responseData.data} /> : ''}
      </>
    );
  }
}

export default FilterTaxonType;
