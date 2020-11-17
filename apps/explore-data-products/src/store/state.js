import cloneDeep from "lodash/cloneDeep";

import NeonContext from 'portal-core-components/lib/components/NeonContext';

import { FetchStateType, BuildStateType } from "../actions/actions";
import {
  INITIAL_FILTER_VALUES,
  INITIAL_FILTER_ITEMS,
  INITIAL_FILTER_ITEM_VISIBILITY,
  DEFAULT_SORT_METHOD,
  DEFAULT_SORT_DIRECTION,
} from '../util/filterUtil';

const getSearchURLParam = () => {
  const match = window.location.search.match(/[?&]search=([^&#]+)/);
  if (!match) { return null; }
  return decodeURIComponent(match[1]);
};

const getSitesURLParams = () => {
  const matches = window.location.search.matchAll(/[?&]site=([A-Z]{4})/g) || [];
  const set = new Set([...matches].map(match => match[1]));
  return Array.from(set);
};

const getStatesURLParams = () => {
  const matches = window.location.search.matchAll(/[?&]state=([A-Z]{2})/g) || [];
  const set = new Set([...matches].map(match => match[1]));
  return Array.from(set);
};

const getDomainsURLParams = () => {
  const matches = window.location.search.matchAll(/[?&]domain=(D[\d]{2})/g) || [];
  const set = new Set([...matches].map(match => match[1]));
  return Array.from(set);
};

const DEFAULT_STATE = {
  appFetchState: FetchStateType.WORKING,
  appBuildState: BuildStateType.AWAITING_DATA,
  neonContextState: cloneDeep(NeonContext.DEFAULT_STATE),

  // Unparsed values sniffed from URL params to seed initial filter values
  // This is here primarily for backward-compatibility with legacy portal pages.
  // (pages that want to link to browse with a filter payload)
  // We don't want to support all filters here. Future iterations should look
  // at more elegant / scalable approaches to arbitrary state injection.
  urlParams: {
    search: getSearchURLParam(),
    sites: getSitesURLParams(),
    states: getStatesURLParams(),
    domains: getDomainsURLParams(),
  },

  // Unparsed search input value sniffed from local storage
  // We only want to pull this out when we initialize the page
  localStorageSearch: localStorage.getItem('search'),
  
  products: {}, // Read-only dictionary of products populated ONCE on page load, indexed by productCode
  productOrder: [], // Sorted list of product codes
  productVisibility: {}, // Mapping by productCode to object containing filter+absolute booleans to track visibility
  productSearchRelevance: {}, // Mapping of productCode to a relevance number for current applied search terms
  productDescriptionExpanded: {}, // Mapping by productCode to booleans to track expanded descriptions

  catalogStats: { // Stats about the entire product catalog we need and can derive once on load
    totalProducts: 0,
    totalSites: 0,
    totalDateRange: [null, null],
  },

  scrollCutoff: 10, // How many potentially visible products to actually show; increase with scroll / reset with filter change
  
  catalogSummaryVisible: false, // Whether catalog summary section is expanded (for xs/sm vieports only)

  sortVisible: false, // Whether sort section is expanded (for xs/sm vieports only)
  sortMethod: DEFAULT_SORT_METHOD,
  sortDirection: DEFAULT_SORT_DIRECTION,
  
  filterValues: { ...INITIAL_FILTER_VALUES }, // Store for current values applied for all filters
  filterItems: { ...INITIAL_FILTER_ITEMS }, // Store for all discrete options for filters that make use of them
  
  allKeywordsByLetter: {}, // Additional store for list of all unique keywords, sorted by first letter.
  totalKeywords: 0, // count of all unique keywords (used for formatting keyword list)

  filtersApplied: [], // List of filter keys that have been applied / are not in a cleared state
  filtersVisible: false, // Whether filter section is expanded (for xs/sm vieports only)
  filterItemVisibility: { ...INITIAL_FILTER_ITEM_VISIBILITY }, // Expanded / collapsed / selected states for filters with >5 options visibility buttons

  aopViewerProducts: [],

  activeDataVisualization: {
    component: null,
    productCode: null,
  },
};

/**
 * Gets a clone of the initial state definition
 */
export const getState = () => cloneDeep(DEFAULT_STATE);



