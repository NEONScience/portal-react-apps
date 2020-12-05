import cloneDeep from 'lodash/cloneDeep';

import {
  /* constants */
  BUNDLE_INHERITIED_FILTER_KEYS,
  COUNTABLE_FILTER_KEYS,
  FILTER_ITEM_VISIBILITY_STATES,
  FILTER_KEYS,
  INITIAL_FILTER_ITEM_VISIBILITY,
  INITIAL_FILTER_ITEMS,
  INITIAL_FILTER_VALUES,
  INITIAL_PRODUCT_VISIBILITY,
  LATEST_AND_PROVISIONAL,
  VISUALIZATIONS,
  /* functions */
  generateSearchFilterableValue,
  parseSearchTerms,
  applyFilter,
  applySort,
  getContinuousDatesArray,
  SORT_METHODS,
  SORT_DIRECTIONS,
} from './filterUtil';

// Array of common strings that appear in short descriptions for bundle children.
// We present the same info in a more visible callout, so we actively scrub it
// from short descriptions.
const EXCISE_BUNDLE_BLURBS = [
  ' This data product is bundled into DP4.00200, Bundled data products - eddy covariance, and is not available as a stand-alone download.',
];

export const INITIAL_PRODUCTS_BY_RELEASE = {
  products: {},
  filterItems: { ...INITIAL_FILTER_ITEMS },
  keywords: {
    allByLetter: {},
    total: 0,
  },
};

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
    const set = new Set([...matches].map(match => decodeURIComponent(match[1])));
    return Array.from(set);
  }
  // Parse - single occurrence
  const match = window.location.search.match(/[?&]release=([^&#]+)/);
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
  ) { return; }
  const { unparsedData } = state.fetches.productsByRelease[release];
  
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

  // Main productsByRelease object map that we'll build using the source data
  const productsByRelease = cloneDeep(INITIAL_PRODUCTS_BY_RELEASE);
  
  // MAIN PRODUCTS LOOP
  // Build the products dictionary that we'll ultimately freeze
  ((unparsedData || {}).products || []).forEach((rawProduct) => {
    const product = {...rawProduct};
    const productCode = product.productCode;

    // Extend/update releases per the releases to which this product belongs
    (product.releases || []).forEach((productRelease) => {
      const idx = newState.releases.findIndex(entry => entry.release === productRelease.release);
      if (idx === -1) {
        newState.releases.push({ ...productRelease, dataProductCodes: new Set([productCode]) });
      } else {
        newState.releases[idx].dataProductCodes.add(productCode);
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
    if ((newState.aopViewerProducts || []).includes(productCode)) {
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

    // LATEST_AND_PROVISIONAL release: initialize some global product-specific values
    if (release === LATEST_AND_PROVISIONAL) {
      // Create initial visibility mapping to filters (all filters null for this product)
      // newState.currentProducts.visibility[productCode] = {...INITIAL_PRODUCT_VISIBILITY};

      // Initialize all descriptions as not expanded
      newState.productsDescriptionExpanded[productCode] = false;
      
      // Update the global filterItems date range to accomodate min/max dates for this product
      const maxDateRangeIdx = product.filterableValues[FILTER_KEYS.DATE_RANGE].length - 1;
      if (
        !newState.catalogStats.totalDateRange[0]
          || product.filterableValues[FILTER_KEYS.DATE_RANGE][0] < newState.catalogStats.totalDateRange[0]
      ) {
        newState.catalogStats.totalDateRange[0] = product.filterableValues[FILTER_KEYS.DATE_RANGE][0];
      }
      if (
        !newState.catalogStats.totalDateRange[1]
          || product.filterableValues[FILTER_KEYS.DATE_RANGE][maxDateRangeIdx] > newState.catalogStats.totalDateRange[1]
      ) {
        newState.catalogStats.totalDateRange[1] = product.filterableValues[FILTER_KEYS.DATE_RANGE][maxDateRangeIdx];
      }
    }

    // Commit the finalized product to the main products dictionary
    productsByRelease.products[productCode] = product;

    // Add the product's keywords to the master list (to be made unique later)
    allKeywords = allKeywords.concat(product.keywords || []);

    // END MAIN PRODUCTS LOOP
  });

  // For Latest and Provisional release: finalize top-level releases object
  // We have dataProductCodes as a Set on each release to make uniqueness easy when building it out.
  // Now loaded we don't expect this data structure to change so convert all those sets to arrays
  // as that's what the ReleaseFilter component expects.
  if (release === LATEST_AND_PROVISIONAL) {
    newState.releases = newState.releases.map(releaseObject => ({
      ...releaseObject,
      dataProductCodes: Array.from(releaseObject.dataProductCodes),
    }));
  }

  // Harvest the global list of valid release tags to serve as valid RELEASE filter items
  // regardless of release
  productsByRelease.filterItems[FILTER_KEYS.RELEASE] = newState.releases.map(r => r.release);

  // Update Bundle Children
  // For all bundle children set certain filterable values related to data availability
  // to that of their parent, then add to the global filter count using the updated values.
  // We skip this for any bundles where forwardAvailability is false or where there is more than
  // one parent.
  Object.keys(bundlesJSON.children)
    .filter(childProductCode => !Array.isArray(bundlesJSON.children[childProductCode]))
    .forEach((childProductCode) => {
      if (!productsByRelease.products[childProductCode]) { return; }
      const parentProductCode = productsByRelease.products[childProductCode].bundle.parent;
      if (!productsByRelease.products[parentProductCode]) { return; }
      if (!bundlesJSON.parents[parentProductCode].forwardAvailability) { return; }
      const parent = productsByRelease.products[parentProductCode];
      BUNDLE_INHERITIED_FILTER_KEYS.forEach((filterKey) => {
        productsByRelease.products[childProductCode].filterableValues[filterKey] = parent.filterableValues[filterKey];
      });
      addProductToFilterItemCounts(productsByRelease.products[childProductCode]);
    });

  // Generate the final keywords object by making allByLetter unique, alphabetized, and split by
  // first letter
  allKeywords = Array.from(new Set(allKeywords));
  allKeywords.sort();
  productsByRelease.keywords.total = allKeywords.length;
  allKeywords.forEach(keyword => {
    let firstLetter = keyword.slice(0, 1).toUpperCase();
    if (!/[A-Z]/.test(firstLetter)) { firstLetter = '#'; }
    if (!productsByRelease.keywords.allByLetter[firstLetter]) {
      productsByRelease.keywords.allByLetter[firstLetter] = [];
    }
    productsByRelease.keywords.allByLetter[firstLetter].push(keyword);
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
    productsByRelease.filterItems[key] = Object.keys(filterItemCounts[key])
      .map(item => ({
        name: getName(item),
        value: item,
        subtitle: getSubtitle(item),
        count: filterItemCounts[key][item],
      }));
  });

  // Expand catalog-wide availability date range array to all possible dates in the range for filter
  productsByRelease.filterItems[FILTER_KEYS.DATE_RANGE] = getContinuousDatesArray(
    newState.catalogStats.totalDateRange,
    true,
  );

  // Sort all global filterItems lists
  productsByRelease.filterItems[FILTER_KEYS.STATES].sort((a, b) => {
    return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
  });
  productsByRelease.filterItems[FILTER_KEYS.DOMAINS].sort((a, b) => {
    return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
  });
  productsByRelease.filterItems[FILTER_KEYS.SITES].sort((a, b) => {
    return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
  });
  productsByRelease.filterItems[FILTER_KEYS.SCIENCE_TEAM].sort((a, b) => {
    return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
  });
  productsByRelease.filterItems[FILTER_KEYS.THEMES].sort((a, b) => {
    return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
  });

  // Derive final stats
  if (release === LATEST_AND_PROVISIONAL) {
    newState.catalogStats.totalProducts = Object.keys(productsByRelease.products).length;
    newState.catalogStats.totalSites = productsByRelease.filterItems[FILTER_KEYS.SITES].length;
  }

  // Freeze the parts of state we don't expect to ever change again
  Object.freeze(productsByRelease.products)
  Object.freeze(productsByRelease.filterItems);
  Object.freeze(productsByRelease.allKeywordsByLetter);
  if (release === LATEST_AND_PROVISIONAL) {
    Object.freeze(newState.catalogStats);
  }

  console.log('RELEASE', release, productsByRelease);

  // Delete the unparsed data now that we're all done with it
  delete state.fetches.productsByRelease[release].unparsedData;

  // XXX
  newState.currentProducts.filterItems = productsByRelease.filterItems;

  // Apply the completed productsByRelease to new state and return the whole thing
  newState.productsByRelease[release] = productsByRelease;
  return newState;
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
