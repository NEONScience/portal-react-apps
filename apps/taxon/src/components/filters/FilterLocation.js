import React, { Component } from "react";
import Select from "react-select";
import NeonApi from "portal-core-components/lib/components/NeonApi";

import { domains } from "../../api/domains";
import { getSitesApiPath } from "../../api/sites";

class FilterLocation extends Component {
  constructor(props) {
    super(props);

    this.domains = domains;
    this.setLocations = this.setLocations.bind(this);
  }

  componentDidMount() {
    let that = this;
    let fetchInit = {
      headers: NeonApi.getApiTokenHeader()
    };
    fetch(getSitesApiPath(), fetchInit)
      .then((response) => response.json())
      .then((data) => {
        if (!data || !data.data || (data.data.length === 0)) {
          throw new Error("Request failed");
        }
        return data.data;
      })
      .then((sites) => {
        let locations = [];
        let siteCodes = sites.filter((site) => {
          if (site && site.siteCode && site.siteDescription) {
            return true;
          }
          return false;
        }).map((site) => {
          return {
            value: site.siteCode,
            label: site.siteDescription + " (" + site.siteCode + ")",
          };
        });

        locations.push.apply(locations, domains);
        locations.push.apply(locations, siteCodes);
        that.setLocations(locations);
      })
      .catch((error) => {
        console.log(error);
      });

      this.setLocations(domains);
  }

  setLocations(locations) {
    if (this.props.onSetLocations) {
      this.props.onSetLocations(locations);
    }
  }

  render() {
    const FILTER_PROP = "locationName";

    const filterStyle = {
      display: "inline-block",
      paddingLeft: 10,
    }

    const inputStyle = {
      width: 300,
      paddingTop: 5,
      paddingBottom: 10,
      textAlign: "left",
    }

    return (
      <div style={filterStyle}>
        <label>Location</label>
        <div style={inputStyle}>
          <Select
            multi={false}
            name="form-field-name"
            placeholder="Select Location..."
            options={this.props.locations}
            value={this.props.selectedValue}
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

export default FilterLocation;
