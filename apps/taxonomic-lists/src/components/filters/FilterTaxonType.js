import React, { Component } from "react";

import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Button from '@material-ui/core/Button';

import DataProductLinks from "./DataProductLinks";

import { taxonTypes } from "../../api/taxonTypes";
import NeonEnvironment from 'portal-core-components/lib/components/NeonEnvironment';

class FilterTaxonType extends Component {

  constructor(props) {
    super(props);
    this.setTaxonTypes = this.setTaxonTypes.bind(this);
    this.state = {
      taxonTypeCode: 'ALGAE',
      dataProductData: []
    };
    this.FILTER_PROP = "taxonTypeCode";
  }

  componentDidMount() {
    console.log('Component mounted.');
    const queryParams = new URLSearchParams(window.location.search);
    const queryTaxonTypeCode = queryParams.get('taxonTypeCode') ?? '';
    if (queryTaxonTypeCode !== '') {
      this.setTaxonTypeCode(queryTaxonTypeCode);
      this.getDataProducts(queryTaxonTypeCode);
    } else {
      this.getDataProducts(this.state.taxonTypeCode);
    }
    this.setTaxonTypes(taxonTypes);
  }

  setTaxonTypeCode(taxonTypeCode) {
    this.setState({ ...this.state, taxonTypeCode: taxonTypeCode });
    this.props.onFilterValueChanged(this.FILTER_PROP, taxonTypeCode);
  }

  setDataProductData(data) {
    this.setState({ ...this.state, dataProductData: data });
  }

  setTaxonTypes(types) {
    if (this.props.onSetTaxonTypes) {
      this.props.onSetTaxonTypes(types);
    }
  }

  getDataProducts(taxonTypeCode) {
    const url = NeonEnvironment.getTaxonTypeDataProductsPath();
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
        this.setDataProductData(json);
      })
      .catch((error) => {
        console.log(`Could not retrieve data products from fetch: ${error.message}.`);
      });
  }

  render() {
    return (
      <>
        <Select
          variant="outlined"
          value={this.props.selectedValue}
          onChange={event => {
            this.props.onFilterValueChanged(this.FILTER_PROP, event.target.value);
            this.getDataProducts(event.target.value); // the selected value is the taxon type code
          }}
          style={{ minWidth: '180px', marginBottom: '16px' }}
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
        {(this.state.dataProductData?.data?.dataProducts) ?
          <DataProductLinks props={this.state.dataProductData.data} /> :
          <div>
            <Button
              variant="contained"
              disabled
              style={{ minWidth: '183px' }}
            >
              View Data Products
            </Button>
          </div>}
      </>
    );
  }
}

export default FilterTaxonType;
