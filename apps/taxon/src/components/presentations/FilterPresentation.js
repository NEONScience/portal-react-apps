import React, { Component } from "react";
import FilterTaxonType from "../filters/FilterTaxonType";
//import FilterLocation from "../filters/FilterLocation";

class FilterPresentation extends Component {
  render() {
    /*
    return (
      <div>
        <FilterTaxonType
          taxonTypes={this.props.taxonTypes}
          selectedValue={this.props.taxonQuery.taxonTypeCode}
          onSetTaxonTypes={this.props.onSetTaxonTypes}
          onFilterValueChanged={this.props.onFilterValueChanged} />
        <FilterLocation
          locations={this.props.locations}
          selectedValue={this.props.taxonQuery.locationName}
          onSetLocations={this.props.onSetLocations}
          onFilterValueChanged={this.props.onFilterValueChanged} />
      </div>
    );
    */
    return (
      <div>
        <FilterTaxonType
          taxonTypes={this.props.taxonTypes}
          selectedValue={this.props.taxonQuery.taxonTypeCode}
          onSetTaxonTypes={this.props.onSetTaxonTypes}
          onFilterValueChanged={this.props.onFilterValueChanged}
        />
      </div>
    );
  }
}

export default FilterPresentation;
