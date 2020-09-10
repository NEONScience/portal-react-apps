import { connect } from "react-redux";
import FilterPresentation from "../presentations/FilterPresentation";
import {
  setTaxonTypes,
  setLocations,
  filterValueChanged
} from "../../actions/actions";

const mapStateToProps = (state) => ({
  taxonTypes: state.taxonTypes,
  locations: state.locations,
  taxonQuery: state.taxonQuery
});

const mapDispatchToProps = (dispatch) => {
  return {
    onSetTaxonTypes: (taxonTypes) =>
      { dispatch(setTaxonTypes(taxonTypes)) },
    onSetLocations: (locations) =>
      { dispatch(setLocations(locations)) },
    onFilterValueChanged: (prop, value) =>
      { dispatch(filterValueChanged(prop, value)) },
  }
};

const FilterContainer = connect(mapStateToProps, mapDispatchToProps)(FilterPresentation)

export default FilterContainer;
