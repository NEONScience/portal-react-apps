import moment from 'moment';

import isEqual from 'lodash/isEqual';

/**
 * Generate a continuous list of "YYYY-MM" strings given an input date range
 * Will extend beginning and end of date range to encompass whole years
 * (e.g. ['2012-06', '2017-08'] => ['2012-01', '2012-02', ..., '2017-12', '2018-01']
 * @param {array} dateRange - array of exactly two "YYYY-MM" strings
 * @param {boolean} roundToYears - if true then extend each side of the range to whole years
 */
export const getContinuousDatesArray = (dateRange, roundToYears = false) => {
  const dateRegex = /^\d{4}-\d{2}$/;
  if (!Array.isArray(dateRange) || dateRange.length !== 2 || dateRange[1] <= dateRange[0]
      || !dateRegex.test(dateRange[0]) || !dateRegex.test(dateRange[1])) {
    return [];
  }
  let startMoment = moment(`${dateRange[0]}-10`);
  let endMoment = moment(`${dateRange[1]}-20`).add(1, 'months');
  if (roundToYears) {
    startMoment = moment(`${dateRange[0]}-10`).startOf('year');
    endMoment = moment(`${dateRange[1]}-20`).endOf('year').add(1, 'months');
  }
  const contionuousRange = [];
  let months = 0;
  const MAX_MONTHS = 960; // If we're going more than 80 years then maybe something is wrong?
  while (startMoment.isBefore(endMoment) && months < MAX_MONTHS) {
    contionuousRange.push(startMoment.format('YYYY-MM'));
    startMoment.add(1, 'months');
    months++;
  }
  return contionuousRange;  
};

// TODO: Move to Core Components?
export const VISUALIZATIONS = {
  TIME_SERIES_VIEWER: {
    key: 'TIME_SERIES_VIEWER',
    name: 'Time Series Viewer',
  },
  AOP_DATA_VIEWER: {
    key: 'AOP_DATA_VIEWER',
    name: 'AOP Data Viewer',
  },
};

export const FILTER_KEYS = {
  SEARCH: 'SEARCH',
  DATA_STATUS: 'DATA_STATUS',
  THEMES: 'THEMES',
  STATES: 'STATES',
  DOMAINS: 'DOMAINS',
  SITES: 'SITES',
  SCIENCE_TEAM: 'SCIENCE_TEAM',
  DATE_RANGE: 'DATE_RANGE',
  VISUALIZATIONS: 'VISUALIZATIONS',
  RELEASE: 'RELEASE',
};

// Filter keys that have a discrete list of filter items (for validating updates)
const LIST_BASED_FILTER_KEYS = [
  FILTER_KEYS.DATA_STATUS,
  FILTER_KEYS.THEMES,
  FILTER_KEYS.STATES,
  FILTER_KEYS.DOMAINS,
  FILTER_KEYS.SITES,
  FILTER_KEYS.SCIENCE_TEAM,
  FILTER_KEYS.VISUALIZATIONS,
];

export const FILTER_LABELS = {
  SEARCH: 'Search',
  DATA_STATUS: 'Data Status',
  THEMES: 'Themes',
  STATES: 'States',
  DOMAINS: 'Domains',
  SITES: 'Sites',
  SCIENCE_TEAM: 'Science Team',
  DATE_RANGE: 'Available Dates',
  VISUALIZATIONS: 'Visualizations',
  RELEASE: 'Release',
};

// Array of filter keys that have discrete and countable items
export const COUNTABLE_FILTER_KEYS = [
  FILTER_KEYS.DATA_STATUS,
  FILTER_KEYS.THEMES,
  FILTER_KEYS.STATES,
  FILTER_KEYS.DOMAINS,
  FILTER_KEYS.SITES,
  FILTER_KEYS.SCIENCE_TEAM,
  FILTER_KEYS.VISUALIZATIONS,
];

// Array of filter keys that bundle children will inherit filter values
// from their parent (keys generally having to do with data availability)
// NOTE: this only applies to bundle children that DO forward availability from the parent
export const BUNDLE_INHERITIED_FILTER_KEYS = [
  FILTER_KEYS.DATA_STATUS,
  FILTER_KEYS.DATE_RANGE,
  FILTER_KEYS.DOMAINS,
  FILTER_KEYS.STATES,
  FILTER_KEYS.SITES,
];

const filterValuesIntersect = (filterValue, productFilterableValues) => (
  productFilterableValues
    .filter(x => filterValue.includes(x))
    .length > 0
);

// Extend an array of search terms to crudely "depluralize" any unquoted plural terms
// This is used to address the issue where a term like "nitrates" may not result in any
// products because only the keyword "nitrate" appears anywhere. This function should only
// ever be shimmed in when processing search terms, NEVER when storing / presenting them
// as the depluralized values showing up out of nowhere would confuse an end user.
// Ultimately a better search relevance algorithm would obviate this function.
const depluralizeSearchTerms = (terms) => {
  const depluralizedTerms = [...terms];
  terms.forEach((term) => {
    if (term.includes(' ')) { return; }
    if (term.slice(term.length - 1) === 's') {
      depluralizedTerms.push(term.slice(0, term.length - 1));
    }
  });
  return depluralizedTerms;
};

// Functions used to apply a filter. One per filter key.
// Each function must take a product object and filter value as args, returning a boolean for
// whether the product should be visible given ONLY this filter and its value.
// Since most filters are validated as an intersection of value (array of string) with an array of
// valid values we start by setting them all to that and then define the special cases below.
const FILTER_FUNCTIONS = {};
Object.keys(FILTER_KEYS).forEach(key => {
  FILTER_FUNCTIONS[key] = (product, value) => (
    filterValuesIntersect(value, product.filterableValues[key])
  );
});
FILTER_FUNCTIONS.SEARCH = (product, value) => (
  value.length
    ? depluralizeSearchTerms(value).some(term => product.filterableValues.SEARCH.includes(term))
    : true
);
FILTER_FUNCTIONS.DATE_RANGE = (product, value) => filterValuesIntersect(
  getContinuousDatesArray(value),
  product.filterableValues.DATE_RANGE,
);
FILTER_FUNCTIONS.DATA_STATUS = (product, value) => value.includes(product.filterableValues.DATA_STATUS);
FILTER_FUNCTIONS.SCIENCE_TEAM = (product, value) => value.includes(product.filterableValues.SCIENCE_TEAM);

export const INITIAL_FILTER_VALUES = {
  SEARCH: [],
  DATA_STATUS: [],
  THEMES: [],
  STATES: [],
  DOMAINS: [],
  SITES: [],
  SCIENCE_TEAM: [],
  DATE_RANGE: [null, null],
  VISUALIZATIONS: [],
  RELEASE: null,
};

export const INITIAL_FILTER_ITEMS = {
  DATA_STATUS: [],
  THEMES: [],
  STATES: [],
  DOMAINS: [],
  SITES: [],
  SCIENCE_TEAM: [],
  DATE_RANGE: [],
  VISUALIZATIONS: [],
  RELEASE: [],
};

export const FILTER_ITEM_VISIBILITY_STATES = {
  COLLAPSED: 'COLLAPSED',
  EXPANDED: 'EXPANDED',
  SELECTED: 'SELECTED',
}

export const INITIAL_FILTER_ITEM_VISIBILITY = {
  SITES: FILTER_ITEM_VISIBILITY_STATES.COLLAPSED,
  STATES: FILTER_ITEM_VISIBILITY_STATES.COLLAPSED,
  DOMAINS :FILTER_ITEM_VISIBILITY_STATES.COLLAPSED,
};

export const INITIAL_PRODUCT_VISIBILITY = {
  // Whether the product should be visible given the currentfilter state
  BY_FILTERS: true,
};
Object.keys(FILTER_KEYS).forEach(filterKey => {
  INITIAL_PRODUCT_VISIBILITY[filterKey] = null;
});

// Helper function used by all sort methods to place all "Coming Soon" products
// below "Available" products regardless of method.
const sortByAvailabiilty = (prodA, prodB) => {
  if (prodA.filterableValues[FILTER_KEYS.DATA_STATUS] !== prodB.filterableValues[FILTER_KEYS.DATA_STATUS]) {
    return prodA.filterableValues[FILTER_KEYS.DATA_STATUS] === 'Available' ? -1 : 1;
  }
  return 0;
}
export const SORT_DIRECTIONS = ['ASC', 'DESC'];
const getSortReturns = sortDirection => [
  sortDirection === 'ASC' ? -1 : 1,
  sortDirection === 'ASC' ? 1 : -1,
];
// One-liner for ascending alphabetical sort. Used by many sort methods as a fallback
// when targeted sortable values are equal between products.
const productNameAscSort = (a, b) => a.productName.toUpperCase() < b.productName.toUpperCase() ? -1 : 1;
export const SORT_METHODS = {
  'productName': {
    label: 'by Product Name',
    isDisabled: () => false, // We can always sort on name!
    getSortFunction: state => (a, b) => {
      const prodA = state.products[a];
      const prodB = state.products[b];
      const byAvailability = sortByAvailabiilty(prodA, prodB);
      if (byAvailability !== 0) { return byAvailability; }
      const ret = getSortReturns(state.sortDirection);
      return prodA.productName.toUpperCase() < prodB.productName.toUpperCase() ? ret[0] : ret[1];
    },
  },
  'oldestAvailableData': {
    label: 'by Oldest Available Data',
    isDisabled: (filterValues) => { // Disable when only showing products with no available data
      const dataStatusFilterValue = filterValues[FILTER_KEYS.DATA_STATUS];
      return (dataStatusFilterValue.length === 1 && dataStatusFilterValue[0] === 'Coming Soon');
    },
    getSortFunction: state => (a, b) => {
      const prodA = state.products[a];
      const prodB = state.products[b];
      const byAvailability = sortByAvailabiilty(prodA, prodB);
      if (byAvailability !== 0) { return byAvailability; }
      if (!prodA.filterableValues[FILTER_KEYS.DATE_RANGE].length || !prodB.filterableValues[FILTER_KEYS.DATE_RANGE].length) {
        return productNameAscSort(prodA, prodB);
      }
      const ret = getSortReturns(state.sortDirection);
      const aDate = prodA.filterableValues[FILTER_KEYS.DATE_RANGE][0];
      const bDate = prodB.filterableValues[FILTER_KEYS.DATE_RANGE][0];
      if (aDate === bDate) { return productNameAscSort(prodA, prodB); }
      return aDate < bDate ? ret[0] : ret[1];
    },
  },
  'newestAvailableData': {
    label: 'by Newest Available Data',
    isDisabled: (filterValues) => { // Disable when only showing products with no available data
      const dataStatusFilterValue = filterValues[FILTER_KEYS.DATA_STATUS];
      return (dataStatusFilterValue.length === 1 && dataStatusFilterValue[0] === 'Coming Soon');
    },
    getSortFunction: state => (a, b) => {
      const prodA = state.products[a];
      const prodB = state.products[b];
      const byAvailability = sortByAvailabiilty(prodA, prodB);
      if (byAvailability !== 0) { return byAvailability; }
      if (!prodA.filterableValues[FILTER_KEYS.DATE_RANGE].length || !prodB.filterableValues[FILTER_KEYS.DATE_RANGE].length) {
        return productNameAscSort(prodA, prodB);
      }
      const ret = getSortReturns(state.sortDirection);
      const aDate = prodA.filterableValues[FILTER_KEYS.DATE_RANGE][prodA.filterableValues[FILTER_KEYS.DATE_RANGE].length - 1];
      const bDate = prodB.filterableValues[FILTER_KEYS.DATE_RANGE][prodB.filterableValues[FILTER_KEYS.DATE_RANGE].length - 1];
      if (aDate === bDate) { return productNameAscSort(prodA, prodB); }
      return aDate < bDate ? ret[0] : ret[1];
    },
  },
  'searchRelevance': {
    label: 'by Search Relevance',
    isDisabled: filterValues => filterValues[FILTER_KEYS.SEARCH].length === 0,
    getSortFunction: state => (a, b) => {
      if (state.productSearchRelevance[a] === state.productSearchRelevance[b]) {
        return productNameAscSort(state.products[a], state.products[b]);
      }
      return state.productSearchRelevance[a] < state.productSearchRelevance[b] ? 1 : -1;
    },
  },
};

export const DEFAULT_SORT_METHOD = 'productName';
export const DEFAULT_SORT_DIRECTION = 'ASC';

/**
 * Calculate a number to reflect the relevance of a given product for a given
 * search filter input (arbitrarily many terms). Things that contribute to score:
 *  - Exact vs. fuzzy matches of a given term (exact: term appears with spaces
 *    on both sides; fuzzy: one or both sides of term match is another letter)
 *  - Frequency of appearance of a given term
 *  - Term length (in that when more than one term is present then a longer term
 *    has a greater impact on the score than a shorter term)
 */
const calculateSearchRelevance = (product, searchTerms) => searchTerms.reduce((score, term) => {
  const regex = new RegExp(`[\\S]{0,1}${term}[\\S]{0,1}`, 'g');
  const matches = (product.filterableValues[FILTER_KEYS.SEARCH] || '').match(regex);
  if (matches) {
    matches.forEach(match => {
      score += (match === term ? 3 : 1) * term.length;
    });
  }
  return score;
}, 0);

/**
 * For a given product/filter visibility mapping calculate the BY_FILTERS visibility of the product.
 * Returns false if any filters for the product are exactly false (i.e. excluded by the filter)
 * Returns true otherwise (i.e. all filters are null - not applied - or true - included by the filter)
 * @param {object} productVisibility - entry from productVisibility object from state for a single product
 * @return {boolean}
 */
const productIsVisibleByFilters = (productVisibility) => !Object.keys(productVisibility)
  .filter(key => !!FILTER_KEYS[key])
  .some(key => productVisibility[key] === false);

/**
 * In a state object: set filter value and apply filter to all products in the productVisibility map
 * (for all products in map: set boolean filter visibility value and recalculate CURRENT visibility)
 * @param {object} state - current whole state object
 * @param {string} filterKey - identifier for filter as it appears in FILTER_KEYS
 * @param {*} filterValue - value to apply to filter
 * @return {object} updated whole state object
 */
export const applyFilter = (state, filterKey, filterValue) => {
  if (!FILTER_KEYS[filterKey]) { return state; }
  const filterFunction = FILTER_FUNCTIONS[filterKey];
  // For list-based filters narrow down to the intersection with available filter items
  let updatedFilterValue = filterValue;
  if (LIST_BASED_FILTER_KEYS.includes(filterKey)) {
    const validValues = state.filterItems[filterKey].map(i => i.value);
    updatedFilterValue = (filterValue || []).filter(v => validValues.includes(v));
  }
  // Apply to state
  const updated = {
    ...state,
    scrollCutoff: 10,
    filterValues: {
      ...state.filterValues,
      [filterKey]: updatedFilterValue,
    },
  };
  // Either add or remove this filter from the applied list depending on the new value
  const otherAppliedFilters = [...state.filtersApplied.filter(f => f !== filterKey)];
  const filterIsNowApplied = !isEqual(updatedFilterValue, INITIAL_FILTER_VALUES[filterKey]);
  updated.filtersApplied = filterIsNowApplied ? [...otherAppliedFilters, filterKey] : otherAppliedFilters;
  // For extendable list-based filters if the filter is not applied then also revert the item visibility
  if (updated.filterItemVisibility[filterKey] && !filterIsNowApplied) {
    updated.filterItemVisibility[filterKey] = FILTER_ITEM_VISIBILITY_STATES.COLLAPSED;
  }
  // Set visibility (and, if necessary, search relevance) for each product
  const depluralizedTerms = filterKey === FILTER_KEYS.SEARCH ? depluralizeSearchTerms(filterValue) : [];
  Object.keys(state.products).forEach((productCode) => {
    updated.productVisibility[productCode][filterKey] = filterIsNowApplied
      ? filterFunction(state.products[productCode], filterValue)
      : null;
    const isVisible = productIsVisibleByFilters(updated.productVisibility[productCode]);
    updated.productVisibility[productCode].BY_FILTERS = isVisible;
    if (filterKey === FILTER_KEYS.SEARCH) {
      updated.productSearchRelevance[productCode] = calculateSearchRelevance(
        state.products[productCode],
        depluralizedTerms,
      );
    }
  });
  // Always change to sort by relevance
  if (filterKey === FILTER_KEYS.SEARCH && filterIsNowApplied) {
    updated.sortMethod = 'searchRelevance';
    updated.sortDirection = 'ASC';
  }
  // Persist updated filter values to localStorage
  localStorage.setItem('filterValues', JSON.stringify(updated.filterValues));
  // Sort and return
  return applySort(updated);
}

/**
 * In state: reset a single filter's value and reset all products in the productVisibility map for that filter
 * (for all products in map: null out filter visibility value and recalculate CURRENT visibility)
 * @param {object} state - current whole state object
 * @param {string} filterKey - identifier for filter as it appears in FILTER_KEYS
 * @return {object} updated whole state object
 */
export const resetFilter = (state, filterKey) => {
  if (!FILTER_KEYS[filterKey]) { return state; }
  const updated = {
    ...state,
    scrollCutoff: 10,
    filtersApplied: state.filtersApplied.filter(f => f !== filterKey),
    filterValues: {
      ...state.filterValues,
      [filterKey]: INITIAL_FILTER_VALUES[filterKey],
    }
  };
  // If this filter is expandable then ensure it's now collapsed
  if (updated.filterItemVisibility[filterKey]) {
    updated.filterItemVisibility[filterKey] = FILTER_ITEM_VISIBILITY_STATES.COLLAPSED;
  }
  // Persist updates to localStorage
  localStorage.setItem('filterValues', JSON.stringify(updated.filterValues));
  localStorage.setItem('filterItemVisibility', JSON.stringify(updated.filterItemVisibility));
  // If resetting search then also remove the search term (not stored with filterValues)
  if (filterKey === FILTER_KEYS.SEARCH) { localStorage.removeItem('search'); }
  Object.keys(updated.productVisibility).forEach((productCode) => {
    updated.productVisibility[productCode][filterKey] = null;
    const isVisible = productIsVisibleByFilters(updated.productVisibility[productCode]);
    updated.productVisibility[productCode].BY_FILTERS = isVisible;
  });
  return applySort(updated);
}

/**
 * Resets all values on all filters (rendering all products visible)
 * Also collapses any expanded filters
 * @param {object} state - current whole state object
 * @return {object} updated state object
 */
export const resetAllFilters = (state) => {
  const updated = {
    ...state,
    scrollCutoff: 10,
    filtersApplied: [],
  };
  Object.keys(FILTER_KEYS).forEach(filterKey => {
    updated.filterValues[filterKey] = INITIAL_FILTER_VALUES[filterKey];
    if (updated.filterItemVisibility[filterKey]) {
      updated.filterItemVisibility[filterKey] = FILTER_ITEM_VISIBILITY_STATES.COLLAPSED;
    }
  });
  // Persist updates to localStorage
  localStorage.removeItem('filterValues');
  localStorage.removeItem('filterItemVisibility');
  localStorage.removeItem('search');
  Object.keys(state.productVisibility).forEach((productCode) => {
    updated.productVisibility[productCode] = { ...INITIAL_PRODUCT_VISIBILITY };
  });
  return applySort(updated);
};

/**
 * In state: change the current item visibility setting for a filter (expand/collapse/show selected)
 * @param {object} state - current whole state object
 * @param {string} filterKey - identifier for filter as it appears in FILTER_KEYS
 * @param {string} visibility - one of the FILTER_ITEM_VISIBILITY_STATES to apply to the filter
 * @return {object} updated whole state object
 */
export const changeFilterItemVisibility = (state, filterKey, visibility) => {
  if (
    !Object.keys(state.filterItemVisibility).includes(filterKey)
      || !Object.keys(FILTER_ITEM_VISIBILITY_STATES).includes(visibility)
  ) { return state; }
  const updated = {
    ...state,
    filterItemVisibility: {
      ...state.filterItemVisibility,
      [filterKey]: FILTER_ITEM_VISIBILITY_STATES[visibility],
    }
  };
  // Persist updates to localStorage
  localStorage.setItem('filterItemVisibility', JSON.stringify(updated.filterItemVisibility));
  return updated;
};

/**
 * In a state object: validate and apply a sortMethod and/or sortDirection, then
 * regenerate productOrder map using BY_FILTERS visible products only
 * @param {object} state - current whole state object
 * @param {string} sortMethod - key in SORT_METHODS object. If not valid will use current state value.
 * @param {string} sortDirection - item in SORT_DIRECTIONS array. If not valid will use current state value.
 * @return {object} updated whole state object
 */
export const applySort = (state, sortMethod = null, sortDirection = null) => {
  const updated = {
    ...state,
    sortMethod: Object.keys(SORT_METHODS).includes(sortMethod) ? sortMethod : state.sortMethod,
    sortDirection: SORT_DIRECTIONS.includes(sortDirection) ? sortDirection : state.sortDirection,
  };
  if (SORT_METHODS[updated.sortMethod].isDisabled(updated.filterValues)) {
    updated.sortMethod = DEFAULT_SORT_METHOD;
    updated.sortDirection = DEFAULT_SORT_DIRECTION;
  }
  // Persist updates to localStorage  
  localStorage.setItem('sortMethod', updated.sortMethod);
  localStorage.setItem('sortDirection', updated.sortDirection);
  const productOrder = Object.keys(updated.productVisibility)
    .filter(productCode => updated.productVisibility[productCode].BY_FILTERS);
  productOrder.sort(SORT_METHODS[updated.sortMethod].getSortFunction(updated));
  updated.productOrder = productOrder;
  return updated;
}

/**
 * Parse an input search string into discrete terms.
 * Supports quoting words together as a single term.
 * Example: '"foo bar" baz' => ['foo bar', 'baz']
 * @param {string} input - string to parse into discrete terms
 */
export const parseSearchTerms = (input) => {
  const terms = input
    .replace(/[^\w\s."]/g, '')
    .match(/(".*?"|[^" \s]+)(?=\s* |\s*$)/g);
  return (terms || [])
    .map(term => term.replace(/"/g, '').toLowerCase());
};

export const generateSearchFilterableValue = (product, neonContextState) => {
  const { sites: sitesJSON, states: statesJSON, domains: domainsJSON } = neonContextState;
  // Add various product meta-data fields
  const search = [
    'productCode',
    'productAbstract',
    'productDescription',
    'productDesignDescription',
    'productName',
    'productRemarks',
    'productScienceTeam',
    'productSensor',
  ].map(field => (product[field] || ''));
  // Add generated filterable values
  [
    'SITES',
    'STATES',
    'DOMAINS',
    'THEMES'
  ].forEach(key => {
    search.push((product.filterableValues[key] || []).join(' '));
  });
  // Flatten and add keywords array
  search.push((product.keywords || []).join(' '));
  // For sites, states, and domains also add additional meta-data (e.g. site description, full state name, etc.)
  search.push(product.filterableValues[FILTER_KEYS.SITES].map(site => sitesJSON[site].description).join(' '));
  search.push(product.filterableValues[FILTER_KEYS.STATES].map(state => statesJSON[state].name).join(' '));
  search.push(product.filterableValues[FILTER_KEYS.DOMAINS].map(domain => domainsJSON[domain].name).join(' '));
  // Include all available data years
  const dataYears = new Set(product.filterableValues[FILTER_KEYS.DATE_RANGE].map(d => d.substr(0, 4)));
  search.push([...dataYears].join(' '));
  // Flatten everything into a single string, cast to lower case, and strip out special characters
  return search.join(' ').toLowerCase().replace(/[^\w. ]/g, ' ').replace(/[ ]{2,}/g, ' ');
};
