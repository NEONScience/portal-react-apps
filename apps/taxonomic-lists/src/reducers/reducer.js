import { ActionType } from "../actions/actions";

const dataApp = (state = {}, action) => {
  let update
  switch (action.type) {
    case ActionType.SET_TAXON_TYPES:
      update = {
        ...state,
        taxonTypes: action.taxonTypes
      }
      return update;
    case ActionType.SET_LOCATIONS:
      update = {
        ...state,
        locations: action.locations
      }
      return update;
    case ActionType.FILTER_VALUE_CHANGED:
      update = {
        ...state,
        taxonQuery: {
          ...state.taxonQuery,
          [action.prop]: action.value
        }
      }
      return update
    case ActionType.TOGGLE_COLUMN_MANAGER_VISIBILITY:
      update = {
        ...state,
        columnManagerVisible: !state.columnManagerVisible
      }
      return update
    case ActionType.SET_TAXON_COLUMNS:
      update = {
        ...state,
        taxonColumns: action.columns
      }
      return update
    case ActionType.TAXON_COLUMN_VISIBILITY_CHANGED:
      update = {
        ...state,
        taxonColumns: state.taxonColumns.map((column) => {
          if (action.queryName === column.queryName) {
            return {
              ...column,
              visible: action.visible
            }
          }
          return column
        })
      }
      return update
    default:
      return state
  }
};

export default dataApp;
