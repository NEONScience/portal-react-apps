import { connect } from "react-redux";
import DataTablePresentation from "../presentations/DataTablePresentation";
import { toggleColumnManagerVisibility } from "../../actions/actions";

const mapStateToProps = (state) => ({
  taxonQuery: state.taxonQuery,
  columns: state.taxonColumns
});

const mapDispatchToProps = (dispatch) => {
  return {
    onToggleColumnManagerVisibility: () =>
      { dispatch(toggleColumnManagerVisibility()); }
  }
};

const DataTableContainer = connect(mapStateToProps, mapDispatchToProps)(DataTablePresentation)

export default DataTableContainer;
