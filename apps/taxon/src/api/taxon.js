import {
  getApiPath,
  getTaxonPath,
  getTaxonDownloadPath
} from "./environment";
import { taxonTypes } from "./taxonTypes";

/**
 * Gets the taxon API endpoint path
 */
export const getTaxonApiPath = () => {
  return getApiPath(getTaxonPath());
}

/**
 * Gets the taxon download API endpoint path
 */
export const getTaxonDownloadApiPath = () => {
  return getApiPath(getTaxonDownloadPath());
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
