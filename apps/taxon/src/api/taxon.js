import NeonEnvironment from 'portal-core-components/lib/components/NeonEnvironment';

import { taxonTypes } from "./taxonTypes";

/**
 * Getter for the taxon API path environment constant
 */
export const getTaxonPath = () => {
  return process.env.REACT_APP_NEON_API_TAXON_PATH;
}
/**
 * Getter for the taxon download API path environment constant
 */
export const getTaxonDownloadPath = () => {
  return process.env.REACT_APP_NEON_API_TAXON_DOWNLOAD_PATH_NAME;
}

/**
 * Gets the taxon API endpoint path
 */
export const getTaxonApiPath = () => {
  return `${NeonEnvironment.getFullApiPath()}/${getTaxonPath()}`;
}

/**
 * Gets the taxon download API endpoint path
 */
export const getTaxonDownloadApiPath = () => {
  return `${NeonEnvironment.getFullApiPath()}/${getTaxonDownloadPath()}`;
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
