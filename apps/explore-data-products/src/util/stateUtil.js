import isEqual from 'lodash/isEqual';

import ExternalHost from 'portal-core-components/lib/components/ExternalHost/ExternalHost';
import BundleService from 'portal-core-components/lib/service/BundleService';
import ReleaseService, { LATEST_AND_PROVISIONAL } from 'portal-core-components/lib/service/ReleaseService';
import { exists, existsNonEmpty, isStringNonEmpty } from 'portal-core-components/lib/util/typeUtil';

import {
  /* constants */
  COUNTABLE_FILTER_KEYS,
  FILTER_ITEM_VISIBILITY_STATES,
  FILTER_KEYS,
  INITIAL_FILTER_ITEM_VISIBILITY,
  INITIAL_FILTER_VALUES,
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

const applyUserRelease = (current, userReleases) => {
  if (!Array.isArray(current) || !Array.isArray(userReleases)) {
    return;
  }
  userReleases.forEach((userRelease) => {
    current.push({
      ...userRelease,
      release: userRelease.releaseTag,
      description: userRelease.description,
      generationDate: userRelease.generationDate
        ? new Date(userRelease.generationDate).toISOString()
        : new Date().toISOString(),
    });
  });
};

const withContextReleases = (neonContextState) => (
  neonContextState?.auth?.userData?.data?.releases || []
);

export const applyAopProductFilter = (state, applyLocalStorage = false) => {
  let newState = { ...state };
  const releaseKeys = Object.keys(newState.productsByRelease);
  if (!Array.isArray(releaseKeys) || (releaseKeys.length <= 0)) {
    return newState;
  }
  if (!Array.isArray(newState.aopVizProducts) || (newState.aopVizProducts.length <= 0)) {
    return newState;
  }
  const filterItemCounts = { [FILTER_KEYS.VISUALIZATIONS]: {} };
  const addProductToFilterItemCounts = (product) => {
    const key = FILTER_KEYS.VISUALIZATIONS;
    const items = product.filterableValues[FILTER_KEYS.VISUALIZATIONS];
    for (let j = 0; j < items.length; j += 1) {
      if (!filterItemCounts[key][items[j]]) { filterItemCounts[key][items[j]] = 0; }
      filterItemCounts[key][items[j]] += 1;
    }
  };
  releaseKeys.forEach((releaseKey) => {
    const productRelease = newState.productsByRelease[releaseKey];
    const productKeys = Object.keys(productRelease);
    if (productKeys && Array.isArray(productKeys)) {
      productKeys.forEach((productKey) => {
        const product = productRelease[productKey];
        if (newState.aopVizProducts.includes(product.productCode)
          && Array.isArray(product.siteCodes)
          && (product.siteCodes.length > 0)
        ) {
          const hasFilterableValue = product.filterableValues[FILTER_KEYS.VISUALIZATIONS]
            .includes(VISUALIZATIONS.AOP_DATA_VIEWER.key);
          if (!hasFilterableValue) {
            product.filterableValues[FILTER_KEYS.VISUALIZATIONS].push(
              VISUALIZATIONS.AOP_DATA_VIEWER.key,
            );
            addProductToFilterItemCounts(product);
          }
        }
      });
    }
  });
  const key = FILTER_KEYS.VISUALIZATIONS;
  const existingFilterItemsValues = newState.filterItems[key].map((item) => item.value);
  const nonDuplicateNewFilterItems = Object.keys(filterItemCounts[key])
    .filter((item) => !existingFilterItemsValues.includes(item))
    .map((item) => ({
      name: VISUALIZATIONS[item] ? VISUALIZATIONS[item].name : null,
      value: item,
      subtitle: null,
      count: filterItemCounts[key][item],
    }));
  newState.filterItems[key] = [...newState.filterItems[key], ...nonDuplicateNewFilterItems];
  if (applyLocalStorage) {
    let appliedFilterValues = newState.localStorageFilterValuesInitialLoad;
    if (!appliedFilterValues) {
      const localFilterValuesUnparsed = localStorage.getItem('filterValues');
      if (localFilterValuesUnparsed) {
        try {
          appliedFilterValues = JSON.parse(localFilterValuesUnparsed);
        } catch {
          // eslint-disable-next-line no-console
          console.error('Unable to rebuild filter values from saved local storage. Stored value is not parseable.');
        }
      }
    }
    Object.keys(appliedFilterValues)
      .filter((filterKey) => filterKey === FILTER_KEYS.VISUALIZATIONS)
      .filter((filterKey) => (newState.filterValues[filterKey] || []).length <= 0)
      .forEach((filterKey) => {
        newState = applyFilter(newState, filterKey, appliedFilterValues[filterKey], false);
      });
    newState = applyCurrentProducts(newState);
  }
  return newState;
};

const mergeDataAva = (dataAvas) => {
  // For multi bundle products, merge bundled availabilities,
  // and consider this product as available
  // when at least one bundled product has available data.
  const availabilitySiteCodes = [];
  if (!existsNonEmpty(dataAvas)) {
    return availabilitySiteCodes;
  }
  // Keyed by site to Set of months
  const multiAvaMerged = {};
  dataAvas.forEach((dataAvaSiteCodes) => {
    if (dataAvaSiteCodes.length > 0) {
      dataAvaSiteCodes.forEach((avaSiteCode) => {
        if (!exists(multiAvaMerged[avaSiteCode.siteCode])) {
          multiAvaMerged[avaSiteCode.siteCode] = {
            availableMonths: new Set(),
            availableReleases: {},
          };
        }
        if (existsNonEmpty(avaSiteCode.availableMonths)) {
          avaSiteCode.availableMonths.forEach((avaMonth) => {
            multiAvaMerged[avaSiteCode.siteCode].availableMonths.add(avaMonth);
          });
        }
        if (existsNonEmpty(avaSiteCode.availableReleases)) {
          avaSiteCode.availableReleases.forEach((avaRelease) => {
            const hasExistingRelease = multiAvaMerged[avaSiteCode.siteCode]
              .availableReleases[avaRelease.release];
            if (!exists(hasExistingRelease)) {
              multiAvaMerged[avaSiteCode.siteCode].availableReleases[avaRelease.release] = {
                availableMonths: new Set(),
              };
            }
            if (existsNonEmpty(avaRelease.availableMonths)) {
              avaRelease.availableMonths.forEach((avaMonth) => {
                multiAvaMerged[avaSiteCode.siteCode]
                  .availableReleases[avaRelease.release]
                  .availableMonths.add(avaMonth);
              });
            }
          });
        }
      });
    }
  });
  Object.keys(multiAvaMerged).sort().forEach((siteCodeKey) => {
    const mergedAvaMonthsSet = multiAvaMerged[siteCodeKey].availableMonths;
    const ava = {
      siteCode: siteCodeKey,
      availableMonths: [],
      availableReleases: [],
    };
    const hasAvaMonths = exists(mergedAvaMonthsSet) && (mergedAvaMonthsSet.size > 0);
    if (hasAvaMonths) {
      ava.availableMonths = [...mergedAvaMonthsSet].sort();
    }
    Object.keys(multiAvaMerged[siteCodeKey].availableReleases)
      .sort()
      .forEach((releaseKey) => {
        const mergedReleaseAvaMonthsSet = multiAvaMerged[siteCodeKey]
          .availableReleases[releaseKey]
          .availableMonths;
        const releaseAva = {
          release: releaseKey,
          availableMonths: [],
        };
        const hasReleaseAvaMonths = exists(mergedReleaseAvaMonthsSet)
          && (mergedReleaseAvaMonthsSet.size > 0);
        if (hasReleaseAvaMonths) {
          releaseAva.availableMonths = [...mergedReleaseAvaMonthsSet].sort();
        }
        if (hasReleaseAvaMonths) {
          ava.availableReleases.push(releaseAva);
        }
      });
    if (hasAvaMonths) {
      availabilitySiteCodes.push(ava);
    }
  });
  return availabilitySiteCodes;
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
    bundles: bundlesCtx,
    timeSeriesDataProducts: timeSeriesDataProductsJSON,
  } = state.neonContextState.data;

  // State object that we'll update and ultimately return
  let newState = { ...state };

  // Get the applicable user releases to apply
  const userReleases = withContextReleases(newState.neonContextState);

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

  // Identify parent bundle indexes for availability lookup
  const bundleRelease = BundleService.determineBundleRelease(release);
  const bundleParentKeys = BundleService.getBundledProductCodes(bundlesCtx, bundleRelease);
  const bundleParentIdxLookup = {};
  const appliedProducts = ((unparsedData || {}).products || []);
  appliedProducts.forEach((product, idx) => {
    if (bundleParentKeys.includes(product.productCode)) {
      bundleParentIdxLookup[product.productCode] = idx;
    }
  });

  // MAIN PRODUCTS LOOP
  // Build the products dictionary that we'll ultimately freeze
  appliedProducts.forEach((rawProduct) => {
    const product = { ...rawProduct };
    const { productCode } = product;

    product.releases = product.releases ? [...product.releases] : [];
    applyUserRelease(product.releases, userReleases);

    // Set bundle values now so we can use them downstream. A bundle child may take on
    // several attributes of its parent so as to be presented properly. Note that some bundle
    // children may have more than one parent, and forwarding availability will never work for them.
    const isBundleChild = BundleService.isProductInBundle(bundlesCtx, bundleRelease, productCode);
    const isBundleParent = BundleService.isBundledProduct(bundlesCtx, bundleRelease, productCode);
    const hasManyParents = isBundleChild
      && BundleService.isSplitProduct(bundlesCtx, bundleRelease, productCode);
    let forwardAvailability = null;
    let availabilityParentCode = null;
    let availabilitySiteCodes = product.siteCodes || [];
    if (isBundleChild) {
      availabilityParentCode = BundleService.getBundleProductCode(
        bundlesCtx,
        bundleRelease,
        productCode,
      );
      if (!Array.isArray(availabilityParentCode)) {
        forwardAvailability = BundleService.shouldForwardAvailability(
          bundlesCtx,
          bundleRelease,
          productCode,
          availabilityParentCode,
        );
      } else {
        const forwardAvailabilityParentCode = availabilityParentCode
          .find((checkAvailabilityParentCode) => (
            BundleService.shouldForwardAvailability(
              bundlesCtx,
              bundleRelease,
              productCode,
              checkAvailabilityParentCode,
            )
          ));
        forwardAvailability = isStringNonEmpty(forwardAvailabilityParentCode);
      }
      if (!Array.isArray(availabilityParentCode)) {
        const parentIdx = bundleParentIdxLookup[availabilityParentCode];
        availabilitySiteCodes = (appliedProducts[parentIdx] || {}).siteCodes || [];
      } else {
        const parentDataAvaSiteCodes = [];
        availabilityParentCode.forEach((checkAvailabilityParentCode) => {
          const parentIdx = bundleParentIdxLookup[checkAvailabilityParentCode];
          const checkParentSiteCodes = (appliedProducts[parentIdx] || {}).siteCodes || [];
          if (checkParentSiteCodes.length > 0) {
            parentDataAvaSiteCodes.push(checkParentSiteCodes);
          }
        });
        availabilitySiteCodes = mergeDataAva(parentDataAvaSiteCodes);
      }
    }
    let appliedBundleParent = null;
    if (isBundleChild) {
      appliedBundleParent = hasManyParents
        ? BundleService.getSplitProductBundles(bundlesCtx, bundleRelease, productCode)
        : BundleService.getBundleProductCode(bundlesCtx, bundleRelease, productCode);
    }
    product.bundle = {
      isChild: isBundleChild,
      isParent: isBundleParent,
      hasManyParents,
      forwardAvailability,
      parent: appliedBundleParent,
      children: isBundleParent
        ? BundleService.getBundledProducts(bundlesCtx, bundleRelease, productCode)
        : null,
    };

    if (product.bundle.isChild) {
      // Bundle children with forwarded availability should have releases identical to the parent
      // for the specified release.
      let parentIdx = null;
      const multiParentIdx = [];
      if (!Array.isArray(availabilityParentCode)) {
        parentIdx = bundleParentIdxLookup[availabilityParentCode];
      } else {
        availabilityParentCode.forEach((checkAvailabilityParentCode) => {
          multiParentIdx.push(bundleParentIdxLookup[checkAvailabilityParentCode]);
        });
      }
      let parentReleases = [];
      if (exists(parentIdx)) {
        const appliedBundleParentFromIdx = appliedProducts[parentIdx];
        if (exists(appliedBundleParentFromIdx)
            && existsNonEmpty(appliedBundleParentFromIdx.releases)) {
          parentReleases = [...appliedBundleParentFromIdx.releases];
        }
      } else if (existsNonEmpty(multiParentIdx)) {
        multiParentIdx.forEach((checkMultiParentIdx) => {
          const appliedBundleParentFromIdx = appliedProducts[checkMultiParentIdx];
          if (exists(appliedBundleParentFromIdx)
              && existsNonEmpty(appliedBundleParentFromIdx.releases)) {
            Array.prototype.push.apply(parentReleases, [...appliedBundleParentFromIdx.releases]);
          }
        });
      }
      const bundleCopiedReleases = parentReleases.filter((bundleParentRelease) => {
        const bundleParentAppliedRelease = BundleService.determineBundleRelease(
          bundleParentRelease.release,
        );
        return BundleService.isProductInBundle(
          bundlesCtx,
          bundleParentAppliedRelease,
          productCode,
        );
      });
      bundleCopiedReleases.forEach((bundleCopiedRelease) => {
        if (exists(bundleCopiedRelease)) {
          const hasRelease = (product.releases || []).some((productRelease) => (
            exists(productRelease)
            && isStringNonEmpty(productRelease.release)
            && (productRelease.release.localeCompare(bundleCopiedRelease.release) === 0)
          ));
          if (!hasRelease) {
            product.releases.push(bundleCopiedRelease);
          }
        }
      });
      applyUserRelease(product.releases, userReleases);
      // Remove bundle blurb from description if this is a bundle child
      EXCISE_BUNDLE_BLURBS.forEach((blurb) => {
        if (product.productDescription.includes(blurb)) {
          product.productDescription = product.productDescription.split(blurb).join('');
        }
      });
    }

    // Determine release when not a "non" release and not a special case release.
    const isRelease = isStringNonEmpty(release)
      && !ReleaseService.isNonRelease(release)
      && !ReleaseService.isLatestNonProv(release);
    const hasDataAva = (availabilitySiteCodes.length > 0);
    let appliedDataStatus;
    if (hasDataAva) {
      appliedDataStatus = 'Available';
    } else {
      // Some external hosts with no availability can be made "Available"
      // with the "allowNoAvailability" flag.
      const externalHost = ExternalHost.getProductSpecificInfo(product.productCode);
      if (!isRelease && exists(externalHost) && (externalHost.allowNoAvailability === true)) {
        appliedDataStatus = 'Available';
      } else if (Array.isArray(product.releases) && (product.releases.length > 0)) {
        // Ensure that the product is not available in any previous release
        // for it to be considered "coming soon"
        const hasNonLatest = product.releases.some((checkRelease) => (
          exists(checkRelease)
          && isStringNonEmpty(checkRelease.release)
          && !ReleaseService.isLatestNonProv(checkRelease.release)
        ));
        if (hasNonLatest) {
          appliedDataStatus = 'Available';
        } else {
          appliedDataStatus = 'Coming Soon';
        }
      } else {
        appliedDataStatus = 'Coming Soon';
      }
    }

    // Generate filterable values - derived values for each product that filters
    // interact with directly. Start with the simple / one-liner ones.
    product.filterableValues = {
      [FILTER_KEYS.SCIENCE_TEAM]: product.productScienceTeam,
      [FILTER_KEYS.RELEASE]: (product.releases || []).map((r) => r.release),
      [FILTER_KEYS.DATA_STATUS]: appliedDataStatus,
      [FILTER_KEYS.SITES]: availabilitySiteCodes.map((s) => s.siteCode),
    };

    // Filterable value for VISUALIZATIONS
    product.filterableValues[FILTER_KEYS.VISUALIZATIONS] = [];
    if ((timeSeriesDataProductsJSON.productCodes || []).includes(productCode) && hasDataAva) {
      product.filterableValues[FILTER_KEYS.VISUALIZATIONS].push(
        VISUALIZATIONS.TIME_SERIES_VIEWER.key,
      );
    }
    if ((newState.aopVizProducts || []).includes(productCode)) {
      const hasFilterableValue = product.filterableValues[FILTER_KEYS.VISUALIZATIONS]
        .includes(VISUALIZATIONS.AOP_DATA_VIEWER.key);
      const hasAvailableData = Array.isArray(availabilitySiteCodes)
        && (availabilitySiteCodes.length > 0);
      if (!hasFilterableValue && hasAvailableData) {
        product.filterableValues[FILTER_KEYS.VISUALIZATIONS].push(
          VISUALIZATIONS.AOP_DATA_VIEWER.key,
        );
      }
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
        newState.localStorageFilterValuesInitialLoad = JSON.parse(localFilterValuesUnparsed);
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
        // eslint-disable-next-line no-console
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
        // eslint-disable-next-line no-console
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
