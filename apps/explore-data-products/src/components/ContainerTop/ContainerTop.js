import { connect } from "react-redux";
import PresentationTop from "../PresentationTop/PresentationTop";
import {
  fetchAppState,
  applySort,
  applyFilter,
  resetFilter,
  resetAllFilters,
  expandFilterItems,
  collapseFilterItems,
  showSelectedFilterItems,
  toggleSortVisibility,
  toggleFilterVisibility,
  toggleCatalogSummaryVisibility,
  expandProductDescription,
  incrementScrollCutoff,
  changeActiveDataVisualization,
  changeNeonContextState,
} from "../../actions/actions";

// Bind state to properties
const mapStateToProps = (state, ownProps) => ({
  // State props
  appFetchState: state.appFetchState,
  appBuildState: state.appBuildState,
  products: state.products,
  productOrder: state.productOrder,
  productVisibility: state.productVisibility,
  productDescriptionExpanded: state.productDescriptionExpanded,
  releases: state.releases,
  catalogStats: state.catalogStats,
  scrollCutoff: state.scrollCutoff,
  urlParams: state.urlParams,
  localStorageSearch: state.localStorageSearch,
  sortVisible: state.sortVisible,
  sortMethod: state.sortMethod,
  sortDirection: state.sortDirection,
  filterValues: state.filterValues,
  filterItems: state.filterItems,
  filtersApplied: state.filtersApplied,
  filtersVisible: state.filtersVisible,
  filterItemVisibility: state.filterItemVisibility,
  catalogSummaryVisible: state.catalogSummaryVisible,
  allKeywordsByLetter: state.allKeywordsByLetter,
  totalKeywords: state.totalKeywords,
  aopViewerProducts: state.aopViewerProducts,
  neonContextState: state.neonContextState,
  activeDataVisualization: state.activeDataVisualization,
  // Own props
  highestOrderDownloadSubject: ownProps.highestOrderDownloadSubject,
});

// Bind callback functions to action types
const mapDispatchToProps = dispatch => ({
  onFetchAppState: () => {
    dispatch(fetchAppState());
  },
  onApplySort: (sortMethod, sortDirection) => {
    dispatch(applySort(sortMethod, sortDirection));
  },
  onApplyFilter: (filterKey, filterValue, showOnlySelected = false) => {
    dispatch(applyFilter(filterKey, filterValue, showOnlySelected));
  },
  onResetFilter: (filterKey) => {
    dispatch(resetFilter(filterKey));
  },
  onResetAllFilters: () => {
    dispatch(resetAllFilters());
  },
  onExpandFilterItems: (filterKey) => {
    dispatch(expandFilterItems(filterKey));
  },
  onCollapseFilterItems: (filterKey) => {
    dispatch(collapseFilterItems(filterKey));
  },
  onShowSelectedFilterItems: (filterKey) => {
    dispatch(showSelectedFilterItems(filterKey));
  },
  onToggleSortVisibility: () => {
    dispatch(toggleSortVisibility());
  },
  onToggleFilterVisibility: () => {
    dispatch(toggleFilterVisibility());
  },
  onToggleCatalogSummaryVisibility: () => {
    dispatch(toggleCatalogSummaryVisibility());
  },
  onExpandProductDescription: (productCode) => {
    dispatch(expandProductDescription(productCode));
  },
  onIncrementScrollCutoff: () => {
    dispatch(incrementScrollCutoff());
  },
  onChangeActiveDataVisualization: (component = null, productCode = null) => {
    dispatch(changeActiveDataVisualization(component, productCode));
  },
  onChangeNeonContextState: (neonContextState) => {
    dispatch(changeNeonContextState(neonContextState));
  },
});

// Bind the products in the global state to the PresentationTop component,
// where they show up as properties
const ContainerTop = connect(mapStateToProps, mapDispatchToProps)(
  PresentationTop
);

export default ContainerTop;
