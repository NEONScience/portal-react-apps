/**
 * Action type definitions
 */
export const ActionType = {
  SET_TAXON_TYPES: "SET_TAXON_TYPES",
  SET_LOCATIONS: "SET_LOCATIONS",
  FILTER_VALUE_CHANGED: "FILTER_VALUE_CHANGED",
  TOGGLE_COLUMN_MANAGER_VISIBILITY: "TOGGLE_COLUMN_MANAGER_VISIBILITY",
  SET_TAXON_COLUMNS: "SET_TAXON_COLUMNS",
  TAXON_COLUMN_VISIBILITY_CHANGED: "TAXON_COLUMN_VISIBILITY_CHANGED",
};

/**
 * Sets the taxon types for selection
 * @param {*} taxonTypes
 */
export const setTaxonTypes = (taxonTypes) => ({
  type: ActionType.SET_TAXON_TYPES,
  taxonTypes,
});

/**
 * Sets the locations for selection
 * @param {*} locations
 */
export const setLocations = (locations) => ({
  type: ActionType.SET_LOCATIONS,
  locations,
});

/**
 * Handles a filter value changed event
 * @param {*} prop The property on the state to modify
 * @param {*} value The value to set
 */
export const filterValueChanged = (prop, value) => ({
  type: ActionType.FILTER_VALUE_CHANGED,
  prop,
  value,
});

/**
 * Toggles the column manager visibility
 */
export const toggleColumnManagerVisibility = () => ({
  type: ActionType.TOGGLE_COLUMN_MANAGER_VISIBILITY,
});

/**
 * Sets the taxon columns
 * @param {*} columns
 */
export const setTaxonColumns = (columns) => ({
  type: ActionType.SET_TAXON_COLUMNS,
  columns,
});

/**
 * Handles a taxon column visibility changed event
 * @param {*} queryName The query name identifier for the column
 * @param {*} visible The visibilty to set
 */
export const taxonColumnVisibilityChanged = (queryName, visible) => ({
  type: ActionType.TAXON_COLUMN_VISIBILITY_CHANGED,
  queryName,
  visible,
});
