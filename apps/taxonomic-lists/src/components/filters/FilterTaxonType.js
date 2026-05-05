/* eslint-disable react/prop-types */
import React, { Component } from "react";

import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';

import NeonEnvironment from 'portal-core-components/lib/components/NeonEnvironment';
// eslint-disable-next-line import/no-named-as-default, import/no-named-as-default-member
import DataProductLinks from "./DataProductLinks";

import { taxonTypes } from "../../api/taxonTypes";

class FilterTaxonType extends Component {
  constructor(props) {
    super(props);
    const {
      onFilterValueChanged,
      onSetTaxonTypes,
      selectedValue,
    } = props;

    this.onFilterValueChanged = onFilterValueChanged;
    this.onSetTaxonTypes = onSetTaxonTypes;
    this.selectedValue = selectedValue;
    this.taxonTypes = taxonTypes;

    this.state = {
      taxonTypeCode: 'ALGAE',
      dataProductData: [],
    };
    this.FILTER_PROP = "taxonTypeCode";
  }

  componentDidMount() {
    const { taxonTypeCode } = this.state;
    const queryParams = new URLSearchParams(window.location.search);
    const queryTaxonTypeCode = queryParams.get('taxonTypeCode') ?? '';
    if (queryTaxonTypeCode !== '') {
      this.setTaxonTypeCode(queryTaxonTypeCode);
      this.getDataProducts(queryTaxonTypeCode);
    } else {
      this.getDataProducts(taxonTypeCode);
    }
    this.setTaxonTypes(taxonTypes);
  }

  setTaxonTypeCode(taxonTypeCode) {
    this.setState((prevState) => ({ ...prevState, taxonTypeCode }));
    this.onFilterValueChanged(this.FILTER_PROP, taxonTypeCode);
  }

  setDataProductData(data) {
    this.setState((prevState) => ({ ...prevState, dataProductData: data }));
  }

  setTaxonTypes(types) {
    if (this.onSetTaxonTypes) {
      this.onSetTaxonTypes(types);
    }
  }

  getDataProducts(taxonTypeCode) {
    const baseUrl = NeonEnvironment.getTaxonTypeDataProductsPath();
    const fullUrl = `${baseUrl}/${taxonTypeCode}`;
    const headers = { 'Content-Type': 'application/json;charset=UTF-8' };
    this.selectedValue = taxonTypeCode;

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
        // eslint-disable-next-line no-console
        console.log(`Could not retrieve data products from fetch: ${error.message}.`);
      });
  }

  render() {
    const { dataProductData } = this.state;
    return (
      <>
        <Select
          variant="outlined"
          value={this.selectedValue}
          onChange={(event) => {
            this.onFilterValueChanged(this.FILTER_PROP, event.target.value);
            this.getDataProducts(event.target.value); // the selected value is the taxon type code
          }}
          style={{ minWidth: '180px', marginBottom: '16px' }}
          SelectDisplayProps={{ style: { padding: '10.5px 16px' } }}
          aria-labelledby="taxon-type-title"
          data-selenium="select-taxon-type"
        >
          {this.taxonTypes.map((taxonType) => (
            <MenuItem key={taxonType.value} value={taxonType.value}>
              {taxonType.label}
            </MenuItem>
          ))}
        </Select>
        {(dataProductData?.data?.dataProducts)
          ? <DataProductLinks props={dataProductData.data} />
          : (
            <div>
              <Button
                variant="contained"
                disabled
                style={{ minWidth: '183px' }}
              >
                View Data Products
              </Button>
            </div>
          )}
      </>
    );
  }
}

export default FilterTaxonType;
