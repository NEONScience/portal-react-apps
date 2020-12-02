import isEqual from 'lodash/isEqual';

import { FetchStateType } from "../actions/actions"

import {
  FILTER_KEYS,
  COUNTABLE_FILTER_KEYS,
  BUNDLE_INHERITIED_FILTER_KEYS,
  FILTER_ITEM_VISIBILITY_STATES,
  INITIAL_FILTER_VALUES,
  INITIAL_FILTER_ITEM_VISIBILITY,
  INITIAL_PRODUCT_VISIBILITY,
  VISUALIZATIONS,
  generateSearchFilterableValue,
  parseSearchTerms,
  applyFilter,
  applySort,
  getContinuousDatesArray,
  SORT_METHODS,
  SORT_DIRECTIONS,
} from "./filterUtil";

// Array of common strings that appear in short descriptions for bundle children.
// We present the same info in a more visible callout, so we actively scrub it
// from short descriptions.
const EXCISE_BUNDLE_BLURBS = [
  ' This data product is bundled into DP4.00200, Bundled data products - eddy covariance, and is not available as a stand-alone download.',
];

export const buildAppState = (state) => {
  const dataStore = {
    ...state,
    appFetchState: FetchStateType.COMPLETE
  }

  const {
    sites: sitesJSON,
    states: statesJSON,
    domains: domainsJSON,
    bundles: bundlesJSON,
    timeSeriesDataProducts: timeSeriesDataProductsJSON,
  } = state.neonContextState.data;

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
      for (let j = 0; j < items.length; j++) {
        if (!filterItemCounts[key][items[j]]) { filterItemCounts[key][items[j]] = 0; }
        filterItemCounts[key][items[j]]++;
      }
    });
  }

  // All Keywords
  // Array of all found keywords across all products that we'll ultimately sort
  // by letter and freeze.
  let allKeywords = [];

  // MAIN PRODUCTS LOOP
  // Build the products dictionary that we'll ultimately freeze
  (state.fetchedProducts || []).forEach((rawProduct) => {
    const product = {...rawProduct};
    const productCode = product.productCode;

    // Extend/update releases per the releases to which this product belongs
    (product.releases || []).forEach((productRelease) => {
      const idx = dataStore.releases.findIndex(entry => entry.release === productRelease.release);
      if (idx === -1) {
        dataStore.releases.push({ ...productRelease, dataProductCodes: new Set([productCode]) });
      } else {
        dataStore.releases[idx].dataProductCodes.add(productCode);
      }
    });

    // Set bundle values now so we can use them downstream. A bundle child may take on
    // several attributes of its parent so as to be presented properly. Note that some bundle
    // children may have more than one parent, and forwarding availability will never work for them.
    const isBundleChild = !!bundlesJSON.children[productCode];
    const isBundleParent = Object.keys(bundlesJSON.parents).includes(productCode);
    let forwardAvailability = null;
    const hasManyParents = Array.isArray(bundlesJSON.children[productCode]);
    if (isBundleChild && !hasManyParents) {
      // eslint-disable-next-line max-len
      forwardAvailability = bundlesJSON.parents[bundlesJSON.children[productCode]].forwardAvailability;
    }
    product.bundle = {
      isChild: isBundleChild,
      isParent: isBundleParent,
      hasManyParents,
      forwardAvailability,
      parent: isBundleChild ? bundlesJSON.children[productCode] : null,
      children: isBundleParent ? (
        Object.keys(bundlesJSON.children)
          .filter(childCode => bundlesJSON.children[childCode] === productCode)
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

    // Create initial visibility mapping to filters (all filters null for this product)
    dataStore.productVisibility[productCode] = {...INITIAL_PRODUCT_VISIBILITY};

    // Initialize all descriptions as not expanded
    dataStore.productDescriptionExpanded[productCode] = false;

    // Generate filterable values - derived values for each product that filters
    // interact with directly. Start with the simple / one-liner ones.
    product.filterableValues = {
      [FILTER_KEYS.DATA_STATUS]: (product.siteCodes || []).length > 0 ? 'Available' : 'Coming Soon',
      [FILTER_KEYS.SITES]: (product.siteCodes || []).map(s => s.siteCode),
      [FILTER_KEYS.SCIENCE_TEAM]: product.productScienceTeam,
      [FILTER_KEYS.RELEASE]: (product.releases || []).map(r => r.release),
    };

    // Filterable value for VISUALIZATIONS
    product.filterableValues[FILTER_KEYS.VISUALIZATIONS] = [];
    if ((timeSeriesDataProductsJSON.productCodes || []).includes(productCode)) {
      product.filterableValues[FILTER_KEYS.VISUALIZATIONS].push(VISUALIZATIONS.TIME_SERIES_VIEWER.key);
    }
    if ((dataStore.aopViewerProducts || []).includes(productCode)) {
      product.filterableValues[FILTER_KEYS.VISUALIZATIONS].push(VISUALIZATIONS.AOP_DATA_VIEWER.key);
    }

    // Filterable value for THEMES (special handling because of lack of ID and
    // incorrect titles from API)
    product.filterableValues[FILTER_KEYS.THEMES] = (product.themes || [])
      .map(theme => (
        theme === 'Land Use, Land Cover, and Land Processes'
          ? 'Land Cover & Processes'
          : theme
      ));

    // Filterable values for STATES (requires sites filterable value)
    product.filterableValues[FILTER_KEYS.STATES] = [...(new Set(
      product.filterableValues[FILTER_KEYS.SITES]
        .map(siteCode => sitesJSON[siteCode] ? sitesJSON[siteCode].stateCode : null)
        .filter(stateCode => stateCode !== null)
    ))];

    // Filterable values for DOMAINS (requires sites filterable value)
    product.filterableValues[FILTER_KEYS.DOMAINS] = [...(new Set(
      product.filterableValues[FILTER_KEYS.SITES]
        .map(siteCode => sitesJSON[siteCode] ? sitesJSON[siteCode].domainCode : null)
        .filter(domainCode => domainCode !== null)
    ))];

    // Filterable value for DATE_RANGE
    product.filterableValues[FILTER_KEYS.DATE_RANGE] = Array.from(
      (new Set((product.siteCodes || []).flatMap(siteCode => siteCode.availableMonths || []))),
    );
    product.filterableValues[FILTER_KEYS.DATE_RANGE].sort();

    // Filterable value for SEARCH - done last as it pulls from all other generated filterable values.
    product.filterableValues[FILTER_KEYS.SEARCH] = generateSearchFilterableValue(product, state.neonContextState.data);

    // Add product to the global filter counts only if it's not a bundle child.
    // After the main products loop we apply some filter values to bundle children
    // from their parent, and only then do we want to add those products to the counts.
    if (!product.bundle.isChild) { addProductToFilterItemCounts(product); }

    // Update the global filterItems date range to accomodate min/max dates for this product
    const maxDateRangeIdx = product.filterableValues[FILTER_KEYS.DATE_RANGE].length - 1;
    if (
      !dataStore.catalogStats.totalDateRange[0] ||
      product.filterableValues[FILTER_KEYS.DATE_RANGE][0] < dataStore.catalogStats.totalDateRange[0]
    ) {
      dataStore.catalogStats.totalDateRange[0] = product.filterableValues[FILTER_KEYS.DATE_RANGE][0];
    }
    if (
      !dataStore.catalogStats.totalDateRange[1] ||
        product.filterableValues[FILTER_KEYS.DATE_RANGE][maxDateRangeIdx] > dataStore.catalogStats.totalDateRange[1]
    ) {
      dataStore.catalogStats.totalDateRange[1] = product.filterableValues[FILTER_KEYS.DATE_RANGE][maxDateRangeIdx];
    }

    // Commit the finalized product to the main products dictionary
    dataStore.products[productCode] = product;

    // Add the product's keywords to the master list (to be made unique later)
    allKeywords = allKeywords.concat(product.keywords || []);

    // END MAIN PRODUCTS LOOP
  });

  // Finalize releases
  // We have dataProductCodes as a Set on each release to make uniqueness easy when building it out.
  // Now loaded we don't expect this data structure to change so convert all those sets to arrays
  // as that's what the ReleaseFilter component expects.
  // Lastly we also harvest the list of valid release tags to serve as valid RELEASE filter items
  dataStore.releases = dataStore.releases.map(release => ({
    ...release,
    dataProductCodes: Array.from(release.dataProductCodes),
  }));
  dataStore.filterItems[FILTER_KEYS.RELEASE] = dataStore.releases.map(r => r.release);

  // Update Bundle Children
  // For all bundle children set certain filterable values related to data availability
  // to that of their parent, then add to the global filter count using the updated values.
  // We skip this for any bundles where forwardAvailability is false or where there is more than
  // one parent.
  Object.keys(bundlesJSON.children)
    .filter(childProductCode => !Array.isArray(bundlesJSON.children[childProductCode]))
    .forEach((childProductCode) => {
      if (!dataStore.products[childProductCode]) { return; }
      const parentProductCode = dataStore.products[childProductCode].bundle.parent;
      if (!dataStore.products[parentProductCode]) { return; }
      if (!bundlesJSON.parents[parentProductCode].forwardAvailability) { return; }
      const parent = dataStore.products[parentProductCode];
      BUNDLE_INHERITIED_FILTER_KEYS.forEach((filterKey) => {
        dataStore.products[childProductCode].filterableValues[filterKey] = parent.filterableValues[filterKey];
      });
      addProductToFilterItemCounts(dataStore.products[childProductCode]);
    });

  // Make the final allKeywordsByLetter object unique, alphabetized, and split by first letter
  allKeywords = Array.from(new Set(allKeywords));
  allKeywords.sort();
  dataStore.totalKeywords = allKeywords.length;
  allKeywords.forEach(keyword => {
    let firstLetter = keyword.slice(0, 1).toUpperCase();
    if (!/[A-Z]/.test(firstLetter)) { firstLetter = '#'; }
    if (!dataStore.allKeywordsByLetter[firstLetter]) {
      dataStore.allKeywordsByLetter[firstLetter] = [];
    }
    dataStore.allKeywordsByLetter[firstLetter].push(keyword);
  });

  // Convert filter item counts into full-fledged filter items (and add meta-data where appropriate)
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
    dataStore.filterItems[key] = Object.keys(filterItemCounts[key])
      .map(item => ({
        name: getName(item),
        value: item,
        subtitle: getSubtitle(item),
        count: filterItemCounts[key][item],
      }));
  });

  // Expand catalog-wide availability date range array to all possible dates in the range for filter
  dataStore.filterItems[FILTER_KEYS.DATE_RANGE] = getContinuousDatesArray(
    dataStore.catalogStats.totalDateRange,
    true,
  );

  // Sort all global filterItems lists
  dataStore.filterItems[FILTER_KEYS.STATES].sort((a, b) => {
    return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
  });
  dataStore.filterItems[FILTER_KEYS.DOMAINS].sort((a, b) => {
    return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
  });
  dataStore.filterItems[FILTER_KEYS.SITES].sort((a, b) => {
    return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
  });
  dataStore.filterItems[FILTER_KEYS.SCIENCE_TEAM].sort((a, b) => {
    return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
  });
  dataStore.filterItems[FILTER_KEYS.THEMES].sort((a, b) => {
    return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
  });

  // Derive final stats
  dataStore.catalogStats.totalProducts = Object.keys(dataStore.products).length;
  dataStore.catalogStats.totalSites = dataStore.filterItems[FILTER_KEYS.SITES].length;

  // Freeze the parts of state we don't expect to ever change again
  Object.freeze(dataStore.products)
  Object.freeze(dataStore.catalogStats);
  Object.freeze(dataStore.filterItems);
  Object.freeze(dataStore.allKeywordsByLetter);

  let newState = dataStore;
  let filterApplied = false;

  /**
     LOCAL STORAGE HYDRATION
     Various aspects of state can persist in local storage with the expectation
     that they'll be "rehydrated" into app state on reload. This is the way we
     preserver stuff like filter state and selected download sites when refreshing
     the page.
  */
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
        newState = applyFilter(newState, key, localFilterValues[key]);
        filterApplied = true;
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
        .filter(key => Object.keys(INITIAL_FILTER_ITEM_VISIBILITY).includes(key))
        .filter(key => Object.keys(FILTER_ITEM_VISIBILITY_STATES).includes(localFilterItemVisibility[key]))
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

  // Apply initial filter state from URL params, if present (overrides local storage)
  // (only select filters supported for backward compatibility with legacy pages)
  if (dataStore.urlParams.search !== null) {
    newState = applyFilter(newState, FILTER_KEYS.SEARCH, parseSearchTerms(newState.urlParams.search));
    filterApplied = true;
  }
  if (dataStore.urlParams.sites !== null && dataStore.urlParams.sites.length) {
    newState = applyFilter(newState, FILTER_KEYS.SITES, newState.urlParams.sites);
    if (newState.filterValues[FILTER_KEYS.SITES].length) {
      newState.filterItemVisibility[FILTER_KEYS.SITES] = FILTER_ITEM_VISIBILITY_STATES.SELECTED;
    }
  }
  if (dataStore.urlParams.states !== null && dataStore.urlParams.states.length) {
    newState = applyFilter(newState, FILTER_KEYS.STATES, newState.urlParams.states);
    if (newState.filterValues[FILTER_KEYS.STATES].length) {
      newState.filterItemVisibility[FILTER_KEYS.STATES] = FILTER_ITEM_VISIBILITY_STATES.SELECTED;
    }
  }
  if (dataStore.urlParams.domains !== null && dataStore.urlParams.domains.length) {
    newState = applyFilter(newState, FILTER_KEYS.DOMAINS, newState.urlParams.domains);
    if (newState.filterValues[FILTER_KEYS.DOMAINS].length) {
      newState.filterItemVisibility[FILTER_KEYS.DOMAINS] = FILTER_ITEM_VISIBILITY_STATES.SELECTED;
    }
  }

  // Applying filters also sorts, so only apply sort here if no filters were applied.
  return filterApplied ? newState : applySort(newState);
}
