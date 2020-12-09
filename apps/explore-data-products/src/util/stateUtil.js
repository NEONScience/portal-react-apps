import isEqual from 'lodash/isEqual';

import {
  /* constants */
  COUNTABLE_FILTER_KEYS,
  FILTER_ITEM_VISIBILITY_STATES,
  FILTER_KEYS,
  INITIAL_FILTER_ITEM_VISIBILITY,
  INITIAL_FILTER_VALUES,
  LATEST_AND_PROVISIONAL,
  SORT_METHODS,
  SORT_DIRECTIONS,
  VISUALIZATIONS,
  /* functions */
  generateSearchFilterableValue,
  parseSearchTerms,
  applyFilter,
  applyCurrentProducts,
  getContinuousDatesArray,
} from './filterUtil';

export const FETCH_STATUS = {
  AWAITING_CALL: 'AWAITING_CALL',
  FETCHING: 'FETCHING',
  ERROR: 'ERROR',
  SUCCESS: 'SUCCESS',
};

export const APP_STATUS = {
  HAS_FETCHES_TO_TRIGGER: 'HAS_FETCHES_TO_TRIGGER',
  FETCHING: 'FETCHING',
  READY: 'READY',
  ERROR: 'ERROR',
};

// Array of common strings that appear in short descriptions for bundle children.
// We present the same info in a more visible callout, so we actively scrub it
// from short descriptions.
const EXCISE_BUNDLE_BLURBS = [
  ' This data product is bundled into DP4.00200, Bundled data products - eddy covariance, and is not available as a stand-alone download.',
];

/**
   parseURLParam
   Pull on or many explicitly supported params out of the URL; parse and retrun for state injection.
*/
export const parseURLParam = (paramName) => {
  // Supported params with regexes and whether they appear one or many times
  const URL_PARAMS = {
    search: {
      regex: /[?&]search=([^&#]+)/,
      hasMany: false,
    },
    release: {
      regex: /[?&]release=([^&#]+)/,
      hasMany: false,
    },
    sites: {
      regex: /[?&]site=([A-Z]{4})/g,
      hasMany: true,
    },
    states: {
      regex: /[?&]state=([A-Z]{2})/g,
      hasMany: true,
    },
    domains: {
      regex: /[?&]domain=(D[\d]{2})/g,
      hasMany: true,
    },
  };
  const urlParam = URL_PARAMS[paramName];
  if (!urlParam) { return null; }
  // Parse - many occurrences
  if (urlParam.hasMany) {
    const matches = window.location.search.matchAll(urlParam.regex) || [];
    const set = new Set([...matches].map((match) => decodeURIComponent(match[1])));
    return Array.from(set);
  }
  // Parse - single occurrence
  const match = window.location.search.match(urlParam.regex);
  if (!match) { return null; }
  return decodeURIComponent(match[1]);
};

/**
   parseProductsData
   Parse a raw response from a products GraphQL query. Refactor into a dictionary by product key and
   for each product generate filterable value lookups.
*/
export const parseProductsByReleaseData = (state, release) => {
  // Release must exist with unparsed data
  if (
    !release || !state.fetches.productsByRelease[release]
      || !state.fetches.productsByRelease[release].unparsedData
  ) { return state; }
  const { unparsedData } = state.fetches.productsByRelease[release];
  if (!unparsedData) { return state; }

  // NeonContext data must be finalized
  if (!state.neonContextState.isFinal) { return state; }
  const {
    sites: sitesJSON,
    states: statesJSON,
    domains: domainsJSON,
    bundles: bundlesJSON,
    timeSeriesDataProducts: timeSeriesDataProductsJSON,
  } = state.neonContextState.data;

  // State object that we'll update and ultimately return
  let newState = { ...state };

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
  // for a single product
  const addProductToFilterItemCounts = (product) => {
    COUNTABLE_FILTER_KEYS.forEach((key) => {
      const items = [FILTER_KEYS.DATA_STATUS, FILTER_KEYS.SCIENCE_TEAM].includes(key)
        ? [product.filterableValues[key]]
        : product.filterableValues[key];
      for (let j = 0; j < items.length; j += 1) {
        if (!filterItemCounts[key][items[j]]) { filterItemCounts[key][items[j]] = 0; }
        filterItemCounts[key][items[j]] += 1;
      }
    });
  };

  // All Release Keywords
  // Array of all found keywords across all products in this release that we'll ultimately sort
  // by letter and freeze.
  let allReleaseKeywords = [];

  // Main productsByRelease object map that we'll build using the source data
  const productsByRelease = {};

  // Sort the unparsed products array by bundle parents first so that when we parse bundle children
  // that pull availability data from parents we know it'll be there
  const unparsedProductsBundleParentsFirst = ((unparsedData || {}).products || []).sort((a) => (
    Object.keys(bundlesJSON.parents).includes(a.productCode) ? -1 : 0
  ));

  // MAIN PRODUCTS LOOP
  // Build the products dictionary that we'll ultimately freeze
  unparsedProductsBundleParentsFirst.forEach((rawProduct) => {
    const product = { ...rawProduct };
    const { productCode } = product;

    // Set bundle values now so we can use them downstream. A bundle child may take on
    // several attributes of its parent so as to be presented properly. Note that some bundle
    // children may have more than one parent, and forwarding availability will never work for them.
    const isBundleChild = !!bundlesJSON.children[productCode];
    const isBundleParent = Object.keys(bundlesJSON.parents).includes(productCode);
    const hasManyParents = isBundleChild && Array.isArray(bundlesJSON.children[productCode]);
    let forwardAvailability = null;
    let availabilitySiteCodes = product.siteCodes || [];
    if (isBundleChild) {
      forwardAvailability = !hasManyParents
        ? bundlesJSON.parents[bundlesJSON.children[productCode]].forwardAvailability
        : bundlesJSON.children[productCode].every(
          (parent) => bundlesJSON.parents[parent].forwardAvailability,
        );
      const availabilityParentCode = hasManyParents
        ? bundlesJSON.children[productCode][0]
        : bundlesJSON.children[productCode];
      availabilitySiteCodes = (productsByRelease[availabilityParentCode] || {}).siteCodes || [];
    }
    product.bundle = {
      isChild: isBundleChild,
      isParent: isBundleParent,
      hasManyParents,
      forwardAvailability,
      parent: isBundleChild ? bundlesJSON.children[productCode] : null,
      children: isBundleParent ? (
        Object.keys(bundlesJSON.children)
          .filter((childCode) => bundlesJSON.children[childCode] === productCode)
      ) : null,
    };

    // Remove bundle blurb from description if this is a bundle child
    if (product.bundle.isChild) {
      EXCISE_BUNDLE_BLURBS.forEach((blurb) => {
        if (product.productDescription.includes(blurb)) {
          product.productDescription = product.productDescription.split(blurb).join('');
        }
      });
    }

    // Generate filterable values - derived values for each product that filters
    // interact with directly. Start with the simple / one-liner ones.
    product.filterableValues = {
      [FILTER_KEYS.SCIENCE_TEAM]: product.productScienceTeam,
      [FILTER_KEYS.RELEASE]: (product.releases || []).map((r) => r.release),
      [FILTER_KEYS.DATA_STATUS]: availabilitySiteCodes.length > 0 ? 'Available' : 'Coming Soon',
      [FILTER_KEYS.SITES]: availabilitySiteCodes.map((s) => s.siteCode),
    };

    // Filterable value for VISUALIZATIONS
    product.filterableValues[FILTER_KEYS.VISUALIZATIONS] = [];
    if ((timeSeriesDataProductsJSON.productCodes || []).includes(productCode)) {
      product.filterableValues[FILTER_KEYS.VISUALIZATIONS].push(
        VISUALIZATIONS.TIME_SERIES_VIEWER.key,
      );
    }
    if ((newState.aopVizProducts || []).includes(productCode)) {
      product.filterableValues[FILTER_KEYS.VISUALIZATIONS].push(
        VISUALIZATIONS.AOP_DATA_VIEWER.key,
      );
    }

    // Filterable value for THEMES (special handling because of lack of ID and
    // incorrect titles from API)
    product.filterableValues[FILTER_KEYS.THEMES] = (product.themes || [])
      .map((theme) => (
        theme === 'Land Use, Land Cover, and Land Processes'
          ? 'Land Cover & Processes'
          : theme
      ));

    // Filterable values for STATES (requires sites filterable value)
    product.filterableValues[FILTER_KEYS.STATES] = [...(new Set(
      product.filterableValues[FILTER_KEYS.SITES]
        .map((siteCode) => (sitesJSON[siteCode] ? sitesJSON[siteCode].stateCode : null))
        .filter((stateCode) => stateCode !== null),
    ))];

    // Filterable values for DOMAINS (requires sites filterable value)
    product.filterableValues[FILTER_KEYS.DOMAINS] = [...(new Set(
      product.filterableValues[FILTER_KEYS.SITES]
        .map((siteCode) => (sitesJSON[siteCode] ? sitesJSON[siteCode].domainCode : null))
        .filter((domainCode) => domainCode !== null),
    ))];

    // Filterable value for DATE_RANGE
    product.filterableValues[FILTER_KEYS.DATE_RANGE] = Array.from(
      (new Set(availabilitySiteCodes.flatMap((siteCode) => siteCode.availableMonths || []))),
    );
    product.filterableValues[FILTER_KEYS.DATE_RANGE].sort();

    // Filterable value for SEARCH - pulls from all other generated filterable values so do last
    product.filterableValues[FILTER_KEYS.SEARCH] = generateSearchFilterableValue(
      product,
      state.neonContextState.data,
    );

    // Add product to the global filter counts
    addProductToFilterItemCounts(product);

    // Ensure a global description expanded boolean is present for this product
    if (typeof newState.productDescriptionExpanded[productCode] === 'undefined') {
      newState.productDescriptionExpanded[productCode] = false;
    }

    // LATEST_AND_PROVISIONAL release single-product opertations
    if (release === LATEST_AND_PROVISIONAL) {
      // Extend/update releases per the releases to which this product belongs
      (product.releases || []).forEach((productRelease) => {
        const idx = newState.releases.findIndex(
          (entry) => entry.release === productRelease.release,
        );
        if (idx === -1) {
          newState.releases.push({ ...productRelease, dataProductCodes: new Set([productCode]) });
        } else {
          newState.releases[idx].dataProductCodes.add(productCode);
        }
      });
      // Initialize some global catalog stat values
      const maxDateRangeIdx = product.filterableValues[FILTER_KEYS.DATE_RANGE].length - 1;
      const rangeStart = product.filterableValues[FILTER_KEYS.DATE_RANGE][0];
      if (
        !newState.catalogStats.totalDateRange[0]
          || rangeStart < newState.catalogStats.totalDateRange[0]
      ) {
        newState.catalogStats.totalDateRange[0] = rangeStart;
      }
      const rangeEnd = product.filterableValues[FILTER_KEYS.DATE_RANGE][maxDateRangeIdx];
      if (
        !newState.catalogStats.totalDateRange[1]
          || rangeEnd > newState.catalogStats.totalDateRange[1]
      ) {
        newState.catalogStats.totalDateRange[1] = rangeEnd;
      }
    }

    // Commit the finalized product to the main products dictionary
    productsByRelease[productCode] = product;

    // Add the product's keywords to the master list (to be made unique later)
    allReleaseKeywords = allReleaseKeywords.concat(product.keywords || []);

    // END MAIN PRODUCTS LOOP
  });

  // For Latest and Provisional release: finalize top-level releases object
  // We have dataProductCodes as a Set on each release to make uniqueness easy when building it out.
  // Now loaded we don't expect this data structure to change so convert all those sets to arrays
  // as that's what the ReleaseFilter component expects.
  if (release === LATEST_AND_PROVISIONAL) {
    newState.releases = newState.releases.map((releaseObject) => ({
      ...releaseObject,
      dataProductCodes: Array.from(releaseObject.dataProductCodes),
    }));
    newState.releases.forEach((releaseObject) => {
      if (typeof newState.productsByRelease[releaseObject.release] === 'undefined') {
        newState.productsByRelease[releaseObject.release] = {};
      }
    });
  }

  // Update global keywords. If not yet initialized then load in everything, otherwise just add
  // what's new. We keep a set of all keywords for quick checking for new additions as well as
  // a data structure organizing all keywords by first letter in alphabetized lists.
  const addKeywordByLetter = (keyword) => {
    let firstLetter = keyword.slice(0, 1).toUpperCase();
    if (!/[A-Z]/.test(firstLetter)) { firstLetter = '#'; }
    if (!newState.keywords.allByLetter[firstLetter]) {
      newState.keywords.allByLetter[firstLetter] = [];
    }
    newState.keywords.allByLetter[firstLetter].push(keyword);
  };
  allReleaseKeywords = new Set(allReleaseKeywords);
  if (state.keywords.all.size === 0) {
    newState.keywords.all = allReleaseKeywords;
    newState.keywords.all.forEach(addKeywordByLetter);
  } else {
    [...allReleaseKeywords]
      .filter((k) => !state.keywords.all.has(k))
      .forEach(addKeywordByLetter);
  }
  // Alphabetize all letters
  Object.keys(newState.keywords.allByLetter).forEach((letter) => {
    newState.keywords.allByLetter[letter].sort();
  });

  // Convert filter item counts into full-fledged filter items (and add meta-data where appropriate)
  // (all filters EXCEPT releases)
  COUNTABLE_FILTER_KEYS.forEach((key) => {
    const getName = (item) => {
      switch (key) {
        case FILTER_KEYS.STATES:
          return statesJSON[item].name;
        case FILTER_KEYS.SCIENCE_TEAM:
          return item.substring(0, item.indexOf('(') - 1);
        case FILTER_KEYS.VISUALIZATIONS:
          return VISUALIZATIONS[item] ? VISUALIZATIONS[item].name : null;
        default:
          return item;
      }
    };
    const getSubtitle = (item) => {
      switch (key) {
        case FILTER_KEYS.SITES:
          return `${sitesJSON[item].description}, ${sitesJSON[item].stateCode}`;
        case FILTER_KEYS.DOMAINS:
          return domainsJSON[item].name;
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
  newState.filterItems[FILTER_KEYS.STATES].sort((a, b) => (
    a.name.toLowerCase().localeCompare(b.name.toLowerCase())
  ));
  newState.filterItems[FILTER_KEYS.DOMAINS].sort((a, b) => (
    a.name.toLowerCase().localeCompare(b.name.toLowerCase())
  ));
  newState.filterItems[FILTER_KEYS.SITES].sort((a, b) => (
    a.name.toLowerCase().localeCompare(b.name.toLowerCase())
  ));
  newState.filterItems[FILTER_KEYS.SCIENCE_TEAM].sort((a, b) => (
    a.name.toLowerCase().localeCompare(b.name.toLowerCase())
  ));
  newState.filterItems[FILTER_KEYS.THEMES].sort((a, b) => (
    a.name.toLowerCase().localeCompare(b.name.toLowerCase())
  ));

  // Derive final stats
  if (release === LATEST_AND_PROVISIONAL) {
    newState.catalogStats.totalProducts = Object.keys(productsByRelease).length;
    newState.catalogStats.totalSites = newState.filterItems[FILTER_KEYS.SITES].length;
    // Expand catalog-wide availability date range array to all possible dates in the range
    newState.filterItems[FILTER_KEYS.DATE_RANGE] = getContinuousDatesArray(
      newState.catalogStats.totalDateRange,
      true,
    );
  }

  // Freeze the parts of state we don't expect to ever change again
  Object.freeze(productsByRelease);
  if (release === LATEST_AND_PROVISIONAL) {
    Object.freeze(newState.catalogStats);
  }

  // Delete the unparsed data now that we're all done with it
  newState.fetches.productsByRelease[release].unparsedData = null;

  // Apply the completed productsByRelease to new state
  newState.productsByRelease[release] = productsByRelease;

  let releaseFilterInitialized = false;

  // Hydrate from local storage
  // Various aspects of state can persist in local storage with the expectation that they'll be
  // "rehydrated" into app state on reload. This is the way we preserve stuff like filter state and
  // selected download sites when refreshing the page.
  if (!state.localStorageInitiallyParsed) {
    // Hydrate from local storage: Filter Values
    const localFilterValuesUnparsed = localStorage.getItem('filterValues');
    if (localFilterValuesUnparsed) {
      try {
        const localFilterValues = JSON.parse(localFilterValuesUnparsed);
        Object.keys(localFilterValues).forEach((key) => {
          if (
            !FILTER_KEYS[key]
              || isEqual(localFilterValues[key], INITIAL_FILTER_VALUES[key])
          ) { return; }
          // Special case: validate release here so we know whether to trigger a fetch or not
          if (
            key === FILTER_KEYS.RELEASE
              && !newState.releases.find((r) => r.release === localFilterValues[key])
          ) {
            return;
          }
          releaseFilterInitialized = true;
          newState = applyFilter(newState, key, localFilterValues[key], false);
        });
      } catch {
        console.error('Unable to rebuild filter values from saved local storage. Stored value is not parseable.');
      }
    }
    // Hydrate from local storage: Filter Item Visibility
    const localFilterItemVisibilityUnparsed = localStorage.getItem('filterItemVisibility');
    if (localFilterItemVisibilityUnparsed) {
      try {
        const localFilterItemVisibility = JSON.parse(localFilterItemVisibilityUnparsed);
        Object.keys(localFilterItemVisibility)
          .filter((key) => Object.keys(INITIAL_FILTER_ITEM_VISIBILITY).includes(key))
          .filter((key) => (
            Object.keys(FILTER_ITEM_VISIBILITY_STATES).includes(localFilterItemVisibility[key])
          ))
          .forEach((key) => {
            newState.filterItemVisibility[key] = localFilterItemVisibility[key];
          });
      } catch {
        console.error('Unable to rebuild filter item visibility from saved local storage. Stored value is not parseable.');
      }
    }
    // Hydrate from local storage: Sort Method
    const localSortMethod = localStorage.getItem('sortMethod');
    if (localSortMethod && Object.keys(SORT_METHODS).includes(localSortMethod)) {
      newState.sortMethod = localSortMethod;
    }
    // Hydrate from local storage: Sort Direction
    const localSortDirection = localStorage.getItem('sortDirection');
    if (localSortDirection && SORT_DIRECTIONS.includes(localSortDirection)) {
      newState.sortDirection = localSortDirection;
    }
    newState.localStorageInitiallyParsed = true;
  }

  // Apply initial filter state from URL params, if present (overrides local storage)
  // (only select filters supported for backward compatibility with legacy pages)
  if (!state.urlParamsInitiallyApplied) {
    if (newState.urlParams.search !== null) {
      newState = applyFilter(
        newState,
        FILTER_KEYS.SEARCH,
        parseSearchTerms(newState.urlParams.search),
        false,
      );
    }
    if (
      newState.urlParams.release !== null
        && newState.releases.find((r) => r.release === newState.urlParams.release)
    ) {
      newState = applyFilter(newState, FILTER_KEYS.RELEASE, newState.urlParams.release, false);
      releaseFilterInitialized = true;
    }
    if (newState.urlParams.sites !== null && newState.urlParams.sites.length) {
      newState = applyFilter(newState, FILTER_KEYS.SITES, newState.urlParams.sites, false);
      if (newState.filterValues[FILTER_KEYS.SITES].length) {
        newState.filterItemVisibility[FILTER_KEYS.SITES] = FILTER_ITEM_VISIBILITY_STATES.SELECTED;
      }
    }
    if (newState.urlParams.states !== null && newState.urlParams.states.length) {
      newState = applyFilter(newState, FILTER_KEYS.STATES, newState.urlParams.states, false);
      if (newState.filterValues[FILTER_KEYS.STATES].length) {
        newState.filterItemVisibility[FILTER_KEYS.STATES] = FILTER_ITEM_VISIBILITY_STATES.SELECTED;
      }
    }
    if (newState.urlParams.domains !== null && newState.urlParams.domains.length) {
      newState = applyFilter(newState, FILTER_KEYS.DOMAINS, newState.urlParams.domains, false);
      if (newState.filterValues[FILTER_KEYS.DOMAINS].length) {
        newState.filterItemVisibility[FILTER_KEYS.DOMAINS] = FILTER_ITEM_VISIBILITY_STATES.SELECTED;
      }
    }
    newState.urlParamsInitiallyApplied = true;
  }

  // If the release filter was applied in the local storage or URL param initializations above then
  // schedule a fetch as needed.
  if (releaseFilterInitialized) {
    const initialRelease = newState.filterValues[FILTER_KEYS.RELEASE];
    if (!newState.fetches.productsByRelease[initialRelease]) {
      newState.fetches.productsByRelease[initialRelease] = {
        status: FETCH_STATUS.AWAITING_CALL,
      };
      newState.appStatus = APP_STATUS.HAS_FETCHES_TO_TRIGGER;
    }
  }

  // Generate the currentProducts structure and return
  return applyCurrentProducts(newState);
};

/**
   parseAnyUnparsedProductSets
   Call parseProductData on any product data sets that were fetched but not parsed, provided that
   the copy of NeonContext state in our main state object is now finalized.
*/
export const parseAnyUnparsedProductSets = (state) => {
  let newState = { ...state };
  if (!state.neonContextState.isFinal) { return state; }
  Object.keys(state.fetches.productsByRelease).forEach((release) => {
    if (!state.fetches.productsByRelease[release].unparsedData) { return; }
    newState = parseProductsByReleaseData(newState, release);
  });
  return newState;
};
