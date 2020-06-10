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
} from "../../actions/actions";

// Bind state to properties
const mapStateToProps = (state, ownProps) => ({
  // State props
  appFetchState: state.appFetchState,
  products: state.products,
  productOrder: state.productOrder,
  productVisibility: state.productVisibility,
  productDescriptionExpanded: state.productDescriptionExpanded,
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
  neonContextData: state.neonContextData,
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
  onApplyFilter: (filterKey, filterValue) => {
    dispatch(applyFilter(filterKey, filterValue));
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
});

// Bind the products in the global state to the PresentationTop component,
// where they show up as properties
const ContainerTop = connect(mapStateToProps, mapDispatchToProps)(
  PresentationTop
);

export default ContainerTop;
