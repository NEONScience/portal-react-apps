import NeonEnvironment from 'portal-core-components/lib/components/NeonEnvironment';

import { taxonTypes } from "./taxonTypes";

/**
 * Gets the taxon API endpoint path
 */
export const getTaxonApiPath = () => {
  return NeonEnvironment.getFullApiPath('taxonomy');
}

/**
 * Gets the taxon download API endpoint path
 */
export const getTaxonDownloadApiPath = () => {
  return NeonEnvironment.getFullApiPath('taxonomyDownload');
}

/**
 * Gets the path for querying data products associated to a taxon type
 * @returns The path
 */
export const getTaxonTypeDataProductsApiPath = () => {
  const taxonApiPath = getTaxonApiPath();
  return `${taxonApiPath}/products`;
}

/**
 * Gets the set of taxon types for selection
 */
export const getTaxonTypes = () => {
  return taxonTypes;
}

/**
 * Gets the display label for the specified taxon type code
 * @param {*} taxonTypeCode
 */
export const getTaxonTypeLabel = (taxonTypeCode) => {
  let taxonType = taxonTypes.reduce((acc, taxonType) => {
    if (taxonType.value === taxonTypeCode) {
      acc = taxonType;
    }
    return acc;
  }, null);

  if (taxonType && taxonType.label) {
    return taxonType.label;
  }

  return "";
}
