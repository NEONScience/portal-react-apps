import cloneDeep from 'lodash/cloneDeep';
import isEqual from 'lodash/isEqual';

export const FILTER_KEYS = {
  SEARCH: 'SEARCH',
  THEMES: 'THEMES',
  SCIENCE_TEAM: 'SCIENCE_TEAM',
  DATE_RANGE: 'DATE_RANGE',
};

// Filter keys that have a discrete list of filter items (for validating updates)
const LIST_BASED_FILTER_KEYS = [
  FILTER_KEYS.THEMES,
  FILTER_KEYS.SCIENCE_TEAM,
];

export const FILTER_LABELS = {
  SEARCH: 'Search',
  THEMES: 'Themes',
  SCIENCE_TEAM: 'Science Team',
  DATE_RANGE: 'Available Dates',
};

// Array of filter keys that have discrete and countable items
export const COUNTABLE_FILTER_KEYS = [
  FILTER_KEYS.THEMES,
  FILTER_KEYS.SCIENCE_TEAM,
];

const filterValuesIntersect = (filterValue, datasetFilterableValues) => (
  datasetFilterableValues
    .filter((x) => filterValue.includes(x))
    .length > 0
);

// Extend an array of search terms to crudely "depluralize" any unquoted plural terms
// This is used to address the issue where a term like "nitrates" may not result in any
// datasets because only the keyword "nitrate" appears anywhere. This function should only
// ever be shimmed in when processing search terms, NEVER when storing / presenting them
// as the depluralized values showing up out of nowhere would confuse an end user.
// Ultimately a better search relevance algorithm would obviate this function.
export const depluralizeSearchTerms = (terms) => {
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
// Each function must take a dataset object and filter value as args, returning a boolean for
// whether the dataset should be visible given ONLY this filter and its value.
// Since most filters are validated as an intersection of value (array of string) with an array of
// valid values we start by setting them all to that and then define the special cases below.
/**
 * Generate a continuous list of years given an input date range
 * (e.g. [2015, 2018] => [2015, 2016, 2017, 2018]
 * @param {array} dateRange - array of exactly two years (as numbers, not strings)
 */
export const getContinuousYearsArray = (dateRange) => {
  const MIN_YEAR = 2000;
  const MAX_YEAR = 2100;
  if (
    !Array.isArray(dateRange) || dateRange.length !== 2
      || !Number.isInteger(dateRange[0]) || !Number.isInteger(dateRange[1])
      || dateRange[0] < MIN_YEAR || dateRange[1] > MAX_YEAR || dateRange[1] <= dateRange[0]
  ) { return []; }
  const contionuousRange = [];
  let y = dateRange[0];
  while (y <= dateRange[1]) {
    contionuousRange.push(y);
    y += 1;
  }
  return contionuousRange;
};
export const FILTER_FUNCTIONS = {};
Object.keys(FILTER_KEYS).forEach((key) => {
  FILTER_FUNCTIONS[key] = (dataset, value) => (
    filterValuesIntersect(value, dataset.filterableValues[key])
  );
});
FILTER_FUNCTIONS.SEARCH = (dataset, value) => (
  value.length
    ? depluralizeSearchTerms(value).some((term) => dataset.filterableValues.SEARCH.includes(term))
    : true
);
FILTER_FUNCTIONS.DATE_RANGE = (dataset, value) => filterValuesIntersect(
  getContinuousYearsArray(value),
  dataset.filterableValues.DATE_RANGE,
);
FILTER_FUNCTIONS.DATA_STATUS = (dataset, value) => (
  value.includes(dataset.filterableValues.DATA_STATUS)
);
FILTER_FUNCTIONS.SCIENCE_TEAM = (dataset, value) => (
  value.includes(dataset.filterableValues.SCIENCE_TEAM)
);

export const INITIAL_FILTER_VALUES = {
  SEARCH: [],
  THEMES: [],
  SCIENCE_TEAM: [],
  DATE_RANGE: [null, null],
};

export const INITIAL_FILTER_ITEMS = {
  DATA_STATUS: [],
  THEMES: [],
  SCIENCE_TEAM: [],
  DATE_RANGE: [],
};

export const INITIAL_DATASET_VISIBILITY = {
  // Whether the dataset should be visible given the currentfilter state
  BY_FILTERS: true,
};
Object.keys(FILTER_KEYS).forEach((filterKey) => {
  INITIAL_DATASET_VISIBILITY[filterKey] = null;
});

export const SORT_DIRECTIONS = ['ASC', 'DESC'];

const getSortReturns = (sortDirection) => [
  sortDirection === 'ASC' ? -1 : 1,
  sortDirection === 'ASC' ? 1 : -1,
];
// One-liner for ascending alphabetical sort. Used by many sort methods as a fallback
// when targeted sortable values are equal between datasets.
const projectTitleAscSort = (a, b) => (
  a.projectTitle.toUpperCase() < b.projectTitle.toUpperCase() ? -1 : 1
);
export const SORT_METHODS = {
  projectTitle: {
    label: 'by Title',
    isDisabled: () => false, // We can always sort on name!
    getSortFunction: (state) => (a, b) => {
      const { datasets } = state;
      const datasetA = datasets[a];
      const datasetB = datasets[b];
      const ret = getSortReturns(state.sortDirection);
      return (
        datasetA.projectTitle.toUpperCase() < datasetB.projectTitle.toUpperCase() ? ret[0] : ret[1]
      );
    },
  },
  oldestAvailableData: {
    label: 'by Oldest Available Data',
    isDisabled: () => false,
    getSortFunction: (state) => (a, b) => {
      const { datasets } = state;
      const datasetA = datasets[a];
      const datasetB = datasets[b];
      if (
        !datasetA.filterableValues[FILTER_KEYS.DATE_RANGE].length
          || !datasetB.filterableValues[FILTER_KEYS.DATE_RANGE].length
      ) {
        return projectTitleAscSort(datasetA, datasetB);
      }
      const ret = getSortReturns(state.sortDirection);
      const aDate = datasetA.filterableValues[FILTER_KEYS.DATE_RANGE][0];
      const bDate = datasetB.filterableValues[FILTER_KEYS.DATE_RANGE][0];
      if (aDate === bDate) { return projectTitleAscSort(datasetA, datasetB); }
      return aDate < bDate ? ret[0] : ret[1];
    },
  },
  newestAvailableData: {
    label: 'by Newest Available Data',
    isDisabled: () => false,
    getSortFunction: (state) => (a, b) => {
      const { datasets } = state;
      const datasetA = datasets[a];
      const datasetB = datasets[b];
      if (
        !datasetA.filterableValues[FILTER_KEYS.DATE_RANGE].length
          || !datasetB.filterableValues[FILTER_KEYS.DATE_RANGE].length
      ) {
        return projectTitleAscSort(datasetA, datasetB);
      }
      const ret = getSortReturns(state.sortDirection);
      const aRangeLength = datasetA.filterableValues[FILTER_KEYS.DATE_RANGE].length;
      const bRangeLength = datasetB.filterableValues[FILTER_KEYS.DATE_RANGE].length;
      const aDate = datasetA.filterableValues[FILTER_KEYS.DATE_RANGE][aRangeLength - 1];
      const bDate = datasetB.filterableValues[FILTER_KEYS.DATE_RANGE][bRangeLength - 1];
      if (aDate === bDate) { return projectTitleAscSort(datasetA, datasetB); }
      return aDate < bDate ? ret[0] : ret[1];
    },
  },
  searchRelevance: {
    label: 'by Search Relevance',
    isDisabled: (filterValues) => filterValues[FILTER_KEYS.SEARCH].length === 0,
    getSortFunction: (state) => (a, b) => {
      const { datasets } = state;
      if (state.currentDatasets.searchRelevance[a] === state.currentDatasets.searchRelevance[b]) {
        return projectTitleAscSort(datasets[a], datasets[b]);
      }
      return (
        state.currentDatasets.searchRelevance[a] < state.currentDatasets.searchRelevance[b] ? 1 : -1
      );
    },
  },
};

export const DEFAULT_SORT_METHOD = 'projectTitle';
export const DEFAULT_SORT_DIRECTION = 'ASC';

/**
 * For a given dataset/filter visibility mapping calculate the BY_FILTERS visibility of the dataset.
 * Returns false if any filters for the dataset are exactly false (i.e. excluded by the filter)
 * Returns true otherwise (i.e. all filters are null/not applie/true/included by the filter)
 * @param {object} datasetVisibility - entry from state datasetVisibility for a single dataset
 * @return {boolean}
 */
export const datasetIsVisibleByFilters = (datasetVisibility) => !Object.keys(datasetVisibility)
  .filter((key) => !!FILTER_KEYS[key])
  .some((key) => datasetVisibility[key] === false);

/**
 * In a state object: validate and apply a sortMethod and/or sortDirection, then
 * regenerate state.currentDatasets.order map using BY_FILTERS visible datasets only
 * @param {object} state - current whole state object
 * @param {string} sortMethod - key in SORT_METHODS object; if invalid use current state value
 * @param {string} sortDirection - item in SORT_DIRECTIONS array; if invalid use current state value
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
  const datasetOrder = Object.keys(updated.currentDatasets.visibility)
    .filter((uuid) => updated.currentDatasets.visibility[uuid].BY_FILTERS);
  datasetOrder.sort(SORT_METHODS[updated.sortMethod].getSortFunction(updated));
  updated.currentDatasets.order = datasetOrder;
  return updated;
};

/**
 * Calculate a number to reflect the relevance of a given dataset for a given
 * search filter input (arbitrarily many terms). Things that contribute to score:
 *  - Exact vs. fuzzy matches of a given term (exact: term appears with spaces
 *    on both sides; fuzzy: one or both sides of term match is another letter)
 *  - Frequency of appearance of a given term
 *  - Term length (in that when more than one term is present then a longer term
 *    has a greater impact on the score than a shorter term)
 */
export const calculateSearchRelevance = (dataset, searchTerms) => (
  searchTerms.reduce((score, term) => {
    let updatedScore = score;
    const regex = new RegExp(`[\\S]{0,1}${term}[\\S]{0,1}`, 'g');
    const matches = (dataset.filterableValues[FILTER_KEYS.SEARCH] || '').match(regex);
    if (matches) {
      matches.forEach((match) => {
        updatedScore += (match === term ? 3 : 1) * term.length;
      });
    }
    return updatedScore;
  }, 0)
);

/**
   applyCurrentDatasets
   Regenerate the currentDatasets object in state. This contains the sorted list of dataset uuid
   along with visiblity mappings and search relevances. It is subject to change (complete
   regeneration) any time the release filter selection changes, as that means it refers to a
   distinct set of dataset data.
*/
export const applyCurrentDatasets = (state) => {
  const { datasets } = state;
  const newState = { ...state };

  // Regenerate dataset visiblity map
  const { filtersApplied, filterValues } = state;
  const depluralizedTerms = depluralizeSearchTerms(filterValues[FILTER_KEYS.SEARCH]);
  newState.currentDatasets.visibility = {};
  Object.keys(datasets).forEach((uuid) => {
    newState.currentDatasets.visibility[uuid] = { ...INITIAL_DATASET_VISIBILITY };
    filtersApplied.forEach((filterKey) => {
      const filterFunction = FILTER_FUNCTIONS[filterKey];
      newState.currentDatasets.visibility[uuid][filterKey] = filterFunction(
        datasets[uuid],
        filterValues[filterKey],
      );
      if (filterKey === FILTER_KEYS.SEARCH) {
        newState.currentDatasets.searchRelevance[uuid] = calculateSearchRelevance(
          datasets[uuid],
          depluralizedTerms,
        );
      }
    });
    const isVisible = datasetIsVisibleByFilters(newState.currentDatasets.visibility[uuid]);
    newState.currentDatasets.visibility[uuid].BY_FILTERS = isVisible;
  });

  return applySort(newState);
};

/**
 * In a state object: set filter value and apply filter to all datasets in the datasetVisibility map
 * (for all datasets in map: set boolean filter visibility value and recalculate CURRENT visibility)
 * @param {object} state - current whole state object
 * @param {string} filterKey - identifier for filter as it appears in FILTER_KEYS
 * @param {*} filterValue - value to apply to filter
 * @param {boolean} returnApplyCurrentDatasets - whether wrap response in applyCurrentDatasets()
 * @return {object} updated whole state object
 */
export const applyFilter = (state, filterKey, filterValue, returnApplyCurrentDatasets = true) => {
  if (!FILTER_KEYS[filterKey]) { return state; }

  // For list-based filters narrow down to the intersection with available filter items
  let updatedFilterValue = filterValue;
  if (LIST_BASED_FILTER_KEYS.includes(filterKey)) {
    const validValues = state.filterItems[filterKey].map((i) => i.value);
    updatedFilterValue = (filterValue || []).filter((v) => validValues.includes(v));
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
  const otherAppliedFilters = [...state.filtersApplied.filter((f) => f !== filterKey)];
  const filterIsNowApplied = !isEqual(updatedFilterValue, INITIAL_FILTER_VALUES[filterKey]);
  updated.filtersApplied = (
    filterIsNowApplied ? [...otherAppliedFilters, filterKey] : otherAppliedFilters
  );

  // Always change to sort by relevance if first applying search
  if (filterKey === FILTER_KEYS.SEARCH && filterIsNowApplied) {
    updated.sortMethod = 'searchRelevance';
    updated.sortDirection = 'ASC';
  }

  // Update currentDatasets with latest filter info and return
  return returnApplyCurrentDatasets ? applyCurrentDatasets(updated) : updated;
};

/**
 * In state: reset a single filter's value and reset datasetVisibility map for that filter
 * (for all datasets in map: null out filter visibility value and recalculate CURRENT visibility)
 * @param {object} state - current whole state object
 * @param {string} filterKey - identifier for filter as it appears in FILTER_KEYS
 * @return {object} updated whole state object
 */
export const resetFilter = (state, filterKey) => {
  if (!FILTER_KEYS[filterKey]) { return state; }
  const updated = {
    ...state,
    scrollCutoff: 10,
    filtersApplied: state.filtersApplied.filter((f) => f !== filterKey),
    filterValues: {
      ...state.filterValues,
      [filterKey]: INITIAL_FILTER_VALUES[filterKey],
    },
  };
  Object.keys(updated.currentDatasets.visibility).forEach((uuid) => {
    updated.currentDatasets.visibility[uuid][filterKey] = null;
    const isVisible = datasetIsVisibleByFilters(updated.currentDatasets.visibility[uuid]);
    updated.currentDatasets.visibility[uuid].BY_FILTERS = isVisible;
  });
  return applyCurrentDatasets(updated);
};

/**
 * Resets all values on all filters (rendering all datasets visible)
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
  Object.keys(FILTER_KEYS).forEach((filterKey) => {
    updated.filterValues[filterKey] = INITIAL_FILTER_VALUES[filterKey];
  });
  Object.keys(state.currentDatasets.visibility).forEach((uuid) => {
    updated.currentDatasets.visibility[uuid] = { ...INITIAL_DATASET_VISIBILITY };
  });
  return applyCurrentDatasets(updated);
};

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
    .map((term) => term.replace(/"/g, '').toLowerCase());
};

export const generateSearchFilterableValue = (dataset) => {
  console.log(dataset);
  return 'foo';
  // export const generateSearchFilterableValue = (dataset, neonContextState) => {
  /*
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
  ].map((field) => (product[field] || ''));
  // Add generated filterable values
  [
    'SITES',
    'STATES',
    'DOMAINS',
    'THEMES',
  ].forEach((key) => {
    search.push((product.filterableValues[key] || []).join(' '));
  });
  // Flatten and add keywords array
  search.push((product.keywords || []).join(' '));
  // For sites, states, and domains also add additional meta-data
  // (e.g. site description, full state name, etc.)
  search.push(
    product.filterableValues[FILTER_KEYS.SITES]
      .map((site) => sitesJSON[site].description)
      .join(' '),
  );
  search.push(
    product.filterableValues[FILTER_KEYS.STATES]
      .map((state) => statesJSON[state].name)
      .join(' '),
  );
  search.push(
    product.filterableValues[FILTER_KEYS.DOMAINS]
      .map((domain) => domainsJSON[domain].name)
      .join(' '),
  );
  // Include all available data years
  const dataYears = new Set(
    product.filterableValues[FILTER_KEYS.DATE_RANGE].map((d) => d.substr(0, 4)),
  );
  search.push([...dataYears].join(' '));
  // Flatten everything into a single string, cast to lower case, and strip out special characters
  return search.join(' ').toLowerCase().replace(/[^\w. ]/g, ' ').replace(/[ ]{2,}/g, ' ');
  */
};

/**
   parseAllDatasets
   Call parseDataset on all datasets that have not yet been parsed, provided that
   the copy of NeonContext state in our main state object is now finalized.
   This function is built to be idempotent - it only moves datasets from unparsed to parsed
*/
export const parseAllDatasets = (state) => {
  if (!state.neonContextState.isFinal) { return state; }
  const newState = { ...state };
  Object.keys(state.unparsedDatasets).forEach((uuid) => {
    newState.datasets[uuid] = cloneDeep({
      ...state.unparsedDatasets[uuid],
      parsed: true,
    });
  });
  newState.unparsedDatasets = {};
  return newState;
};
