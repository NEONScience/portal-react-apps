import React, { Component } from "react";
import Typography from "@material-ui/core/Typography";

class InfoPresentation extends Component {
  render() {
    let olStyle = {
      fontFamily: "\"Source Sans Pro\",Helvetica,Arial,sans-serif",
      fontWeight: 400,
      lineHeight: 1.5,
    };
    return (
      <div>
        <Typography variant="body1">
          The taxon viewer provides access to NEON's taxon lists. Taxon lists are compiled from a variety
          of published sources and are used to:
        </Typography>
        <ol style={olStyle}>
          <li>
            Constrain data entry to verified scientific names
          </li>
          <li>
            Constrain data entry to known geographic ranges
          </li>
          <li>
            Track rare, threatened and endangered species
          </li>
          <li>
            Provide information on means of establishment (i.e. native vs introduced)
          </li>
          <li>
            Provide higher taxonomy
          </li>
          <li>
            Map taxonomic synonymies
          </li>
        </ol>
        <Typography variant="body1">
          The availability and accuracy of
          source data varies by taxonomic group. NEON anticipates these lists will be updated and refined
          over time.
        </Typography>
        <br/>
        <Typography variant="body1">
          In general, NEON field staff (aka parataxonomists) are limited to selecting only taxa whose
          geographic range extends over the sampling location. NEON staff may use either the accepted
          scientific name or any known synonym, but, for consistency, nomenclature provided on the data
          portal reflects the accepted name and its corresponding higher taxonomy (rather than the
          synonym selected). Expert taxonomists contracted by NEON are permitted to return data with
          taxonomic identifications unconstrained by expected geographic range. Expanded data packages
          contain the exact nomenclature
          provided by the expert taxonomist, including their assignment of higher taxonomy. Basic packages
          reflect the accepted name (according to the NEON taxon list) and its corresponding higher
          taxonomy. See individual data products and their associated documentation for further details.
        </Typography>
      </div>
    );
  }
}

export default InfoPresentation;
