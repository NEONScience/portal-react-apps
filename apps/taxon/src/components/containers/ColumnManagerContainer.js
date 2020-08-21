import { connect } from "react-redux";
import ColumnManagerPresentation from "../presentations/ColumnManagerPresentation";
import {
  setTaxonColumns,
  taxonColumnVisibilityChanged,
  toggleColumnManagerVisibility
} from "../../actions/actions";

const mapStateToProps = (state) => ({
  columnManagerVisible: state.columnManagerVisible,
  columns: state.taxonColumns
});

const mapDispatchToProps = (dispatch) => {
  return {
    onSetColumns: (columns) =>
      { dispatch(setTaxonColumns(columns)) },
    onColumnVisibilityChanged: (name, value, checked) => {
      dispatch(taxonColumnVisibilityChanged(value, checked)) },
    onToggleColumnManagerVisibility: () =>
      { dispatch(toggleColumnManagerVisibility()); }
  }
};

const ColumnManagerContainer = connect(mapStateToProps, mapDispatchToProps)(ColumnManagerPresentation)

export default ColumnManagerContainer;
