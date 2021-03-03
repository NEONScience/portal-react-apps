import cloneDeep from 'lodash/cloneDeep';
import isEqual from 'lodash/isEqual';

export const FILTER_KEYS = {
  SEARCH: 'SEARCH',
  THEMES: 'THEMES',
  SCIENCE_TEAM: 'SCIENCE_TEAM',
  TIME_RANGE: 'TIME_RANGE',
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
  TIME_RANGE: 'Time Range',
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

export const getUuidFromURL = (pathname = window.location.pathname) => {
  const uuid = String.raw`[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}`;
  const regex = RegExp(`prototype-datasets/(${uuid})`, 'g');
  const urlParts = regex.exec(pathname);
  return !urlParts ? null : urlParts[1] || null;
};

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
 * Generate a continuous list of years given an input time range
 * (e.g. [2015, 2018] => [2015, 2016, 2017, 2018]
 * @param {array} timeRange - array of exactly two years (as numbers, not strings)
 */
export const getContinuousYearsArray = (timeRange) => {
  const MIN_YEAR = 2000;
  const MAX_YEAR = 2100;
  if (
    !Array.isArray(timeRange) || timeRange.length !== 2
      || !Number.isInteger(timeRange[0]) || !Number.isInteger(timeRange[1])
      || timeRange[0] < MIN_YEAR || timeRange[1] > MAX_YEAR || timeRange[1] < timeRange[0]
  ) { return []; }
  const contionuousRange = [];
  let y = timeRange[0];
  while (y <= timeRange[1]) {
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
FILTER_FUNCTIONS.TIME_RANGE = (dataset, value) => filterValuesIntersect(
  getContinuousYearsArray(value),
  dataset.filterableValues.TIME_RANGE,
);

export const INITIAL_FILTER_VALUES = {
  SEARCH: [],
  THEMES: [],
  SCIENCE_TEAM: [],
  TIME_RANGE: [null, null],
};

export const INITIAL_FILTER_ITEMS = {
  THEMES: [],
  SCIENCE_TEAM: [],
  TIME_RANGE: [],
};

export const INITIAL_DATASET_VISIBILITY = {
  // Whether the dataset should be visible given the currentfilter state
  BY_FILTERS: true,
};
Object.keys(FILTER_KEYS).forEach((filterKey) => {
  INITIAL_DATASET_VISIBILITY[filterKey] = null;
});

export const SORT_DIRECTIONS = ['ASC', 'DESC'];

const getSortReturns = (direction) => [
  direction === 'ASC' ? -1 : 1,
  direction === 'ASC' ? 1 : -1,
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
      const ret = getSortReturns(state.sort.direction);
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
        !datasetA.filterableValues[FILTER_KEYS.TIME_RANGE].length
          || !datasetB.filterableValues[FILTER_KEYS.TIME_RANGE].length
      ) {
        return projectTitleAscSort(datasetA, datasetB);
      }
      const ret = getSortReturns(state.sort.direction);
      const aYear = datasetA.filterableValues[FILTER_KEYS.TIME_RANGE][0];
      const bYear = datasetB.filterableValues[FILTER_KEYS.TIME_RANGE][0];
      if (aYear === bYear) { return projectTitleAscSort(datasetA, datasetB); }
      return aYear < bYear ? ret[0] : ret[1];
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
        !datasetA.filterableValues[FILTER_KEYS.TIME_RANGE].length
          || !datasetB.filterableValues[FILTER_KEYS.TIME_RANGE].length
      ) {
        return projectTitleAscSort(datasetA, datasetB);
      }
      const ret = getSortReturns(state.sort.direction);
      const aRangeLength = datasetA.filterableValues[FILTER_KEYS.TIME_RANGE].length;
      const bRangeLength = datasetB.filterableValues[FILTER_KEYS.TIME_RANGE].length;
      const aYear = datasetA.filterableValues[FILTER_KEYS.TIME_RANGE][aRangeLength - 1];
      const bYear = datasetB.filterableValues[FILTER_KEYS.TIME_RANGE][bRangeLength - 1];
      if (aYear === bYear) { return projectTitleAscSort(datasetA, datasetB); }
      return aYear < bYear ? ret[0] : ret[1];
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
 * In a state object: validate and apply a method and/or direction, then
 * regenerate state.currentDatasets.order map using BY_FILTERS visible datasets only
 * @param {object} state - current whole state object
 * @param {string} method - key in SORT_METHODS object; if invalid use current state value
 * @param {string} direction - item in SORT_DIRECTIONS array; if invalid use current state value
 * @return {object} updated whole state object
 */
export const applySort = (state, method = null, direction = null) => {
  const updated = {
    ...state,
    sort: {
      method: Object.keys(SORT_METHODS).includes(method) ? method : state.sort.method,
      direction: SORT_DIRECTIONS.includes(direction) ? direction : state.sort.direction,
    },
  };
  if (SORT_METHODS[updated.sort.method].isDisabled(updated.filterValues)) {
    updated.sort.method = DEFAULT_SORT_METHOD;
    updated.sort.direction = DEFAULT_SORT_DIRECTION;
  }
  const datasetOrder = Object.keys(updated.currentDatasets.visibility)
    .filter((uuid) => updated.currentDatasets.visibility[uuid].BY_FILTERS);
  datasetOrder.sort(SORT_METHODS[updated.sort.method].getSortFunction(updated));
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
    updated.sort.method = 'searchRelevance';
    updated.sort.direction = 'ASC';
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
  // const { sites: sitesJSON, states: statesJSON, domains: domainsJSON } = neonContextState;
  // Add various dataset meta-data fields
  const search = [
    'projectTitle',
    'projectDescription',
    'designDescription',
    'metadataDescription',
    'studyAreaDescription',
    'datasetAbstract',
  ].map((field) => (dataset[field] || ''));
  // Add generated filterable values
  [
    'SCIENCE_TEAMS',
    'TIME_RANGE',
    'THEMES',
  ].forEach((key) => {
    search.push((dataset.filterableValues[key] || []).join(' '));
  });
  // Flatten and add keywords array
  search.push((dataset.keywords || []).join(' '));
  // For sites, states, and domains also add additional meta-data
  // (e.g. site description, full state name, etc.)
  /*
  search.push(
    dataset.filterableValues[FILTER_KEYS.SITES]
      .map((site) => sitesJSON[site].description)
      .join(' '),
  );
  search.push(
    dataset.filterableValues[FILTER_KEYS.STATES]
      .map((state) => statesJSON[state].name)
      .join(' '),
  );
  search.push(
    dataset.filterableValues[FILTER_KEYS.DOMAINS]
      .map((domain) => domainsJSON[domain].name)
      .join(' '),
  );
  */
  // Flatten everything into a single string, cast to lower case, and strip out special characters
  return search.join(' ').toLowerCase().replace(/[^\w. ]/g, ' ').replace(/[ ]{2,}/g, ' ');
};

/**
   parseDataset
*/
const parseDataset = (rawDataset, neonContextData = {}) => {
  const newDataset = cloneDeep({ ...rawDataset, filterableValues: {} });
  // Filterable value for SCIENCE_TEAM
  newDataset.filterableValues[FILTER_KEYS.SCIENCE_TEAM] = rawDataset.scienceTeams || [];
  // Filterable value for THEMES (special handling for lack of ID / incorrect titles from API)
  newDataset.filterableValues[FILTER_KEYS.THEMES] = (rawDataset.dataThemes || [])
    .map((theme) => (
      theme === 'Land Use, Land Cover, and Land Processes'
        ? 'Land Cover & Processes'
        : theme
    ));
  // Filterable value for TIME_RANGE
  newDataset.timeRange = [
    Number.parseInt(rawDataset.startYear, 10) || null,
    Number.parseInt(rawDataset.endYear, 10) || null,
  ];
  newDataset.filterableValues[FILTER_KEYS.TIME_RANGE] = (
    getContinuousYearsArray(newDataset.timeRange)
  );
  // Filterable value for SEARCH - pulls from all other generated filterable values so do last
  newDataset.filterableValues[FILTER_KEYS.SEARCH] = generateSearchFilterableValue(
    newDataset,
    neonContextData,
  );
  return newDataset;
};

/**
   parseAllDatasets
   Call parseDataset on all datasets that have not yet been parsed, provided that
   the copy of NeonContext state in our main state object is now finalized.
   This function is built to be idempotent - it only moves datasets from unparsed to parsed
*/
export const parseAllDatasets = (state) => {
  if (!state.neonContextState.isFinal) { return state; }

  const { neonContextState: { data: neonContextData } } = state;
  const newState = { ...state };

  // Filter Item Counts
  // A filter item is an option a filter can have (e.g. all possible states, sites, etc.)
  // for filters with discrete options. To build the lists of all filter items we start out
  // with counts keyed by item value. This ensures unique values and can be expanded to include
  // meta-data (where appropriate) after all the counting is complete.
  const filterItemCounts = {};
  COUNTABLE_FILTER_KEYS.forEach((key) => {
    filterItemCounts[key] = {};
  });

  // Function Initiate/increment counts for counted items in global filter item counts
  // for a single dataset
  const addDatasetToFilterItemCounts = (dataset) => {
    COUNTABLE_FILTER_KEYS.forEach((key) => {
      const items = !Array.isArray(dataset.filterableValues[key])
        ? [dataset.filterableValues[key]]
        : dataset.filterableValues[key];
      for (let j = 0; j < items.length; j += 1) {
        if (!filterItemCounts[key][items[j]]) { filterItemCounts[key][items[j]] = 0; }
        filterItemCounts[key][items[j]] += 1;
      }
    });
  };

  // MAIN LOOP - parse each dataset and add to the running global filterItemCounts
  Object.keys(state.unparsedDatasets).forEach((uuid) => {
    // Parse the dataset
    newState.datasets[uuid] = parseDataset(state.unparsedDatasets[uuid], neonContextData);

    // Add its filter items to overall counts
    addDatasetToFilterItemCounts(newState.datasets[uuid]);

    // Apply dataset time range to expand the current stats totalTimeRange
    const {
      filterableValues: { [FILTER_KEYS.TIME_RANGE]: datasetTimeRange },
    } = newState.datasets[uuid];
    const maxTimeRangeIdx = datasetTimeRange.length - 1;
    const rangeStart = datasetTimeRange[0];
    if (!newState.stats.totalTimeRange[0] || rangeStart < newState.stats.totalTimeRange[0]) {
      newState.stats.totalTimeRange[0] = rangeStart;
    }
    const rangeEnd = datasetTimeRange[maxTimeRangeIdx];
    if (!newState.stats.totalTimeRange[1] || rangeEnd > newState.stats.totalTimeRange[1]) {
      newState.stats.totalTimeRange[1] = rangeEnd;
    }
  });

  // Convert filter item counts into full-fledged filter items (and add meta-data where appropriate)
  // (all filters EXCEPT releases)
  COUNTABLE_FILTER_KEYS.forEach((key) => {
    const getName = (item) => {
      switch (key) {
        case FILTER_KEYS.SCIENCE_TEAM:
          return item.substring(0, item.indexOf('(') - 1);
        default:
          return item;
      }
    };
    const getSubtitle = (item) => {
      switch (key) {
        case FILTER_KEYS.SCIENCE_TEAM:
          return item.substring(item.indexOf('('));
        default:
          return null;
      }
    };
    const existingFilterItemsValues = newState.filterItems[key].map((item) => item.value);
    const nonDuplicateNewFilterItems = Object.keys(filterItemCounts[key])
      .filter((item) => !existingFilterItemsValues.includes(item))
      .map((item) => ({
        name: getName(item),
        value: item,
        subtitle: getSubtitle(item),
        count: filterItemCounts[key][item],
      }));
    newState.filterItems[key] = [...newState.filterItems[key], ...nonDuplicateNewFilterItems];
  });

  // Sort all global filterItems lists
  newState.filterItems[FILTER_KEYS.SCIENCE_TEAM].sort((a, b) => (
    a.name.toLowerCase().localeCompare(b.name.toLowerCase())
  ));
  newState.filterItems[FILTER_KEYS.THEMES].sort((a, b) => (
    a.name.toLowerCase().localeCompare(b.name.toLowerCase())
  ));

  // Derive final stats
  newState.stats.totalDatasets = Object.keys(newState.datasets).length;
  newState.filterItems[FILTER_KEYS.TIME_RANGE] = getContinuousYearsArray(
    newState.stats.totalTimeRange,
  );

  // Blow away unparsedDatasets and be done
  newState.unparsedDatasets = {};
  return applyCurrentDatasets(newState);
};
