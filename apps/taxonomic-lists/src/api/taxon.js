import NeonEnvironment from 'portal-core-components/lib/components/NeonEnvironment';

import { taxonTypes } from "./taxonTypes";

/**
 * Gets the taxon API endpoint path
 */
export const getTaxonApiPath = () => NeonEnvironment.getFullApiPath('taxonomy');

/**
 * Gets the taxon download API endpoint path
 */
export const getTaxonDownloadApiPath = () => NeonEnvironment.getFullApiPath('taxonomyDownload');

/**
 * Gets the path for querying data products associated to a taxon type
 * @returns The path
 */
export const getTaxonTypeDataProductsApiPath = () => {
  const taxonApiPath = getTaxonApiPath();
  return `${taxonApiPath}/products`;
};

/**
 * Gets the set of taxon types for selection
 */
export const getTaxonTypes = () => taxonTypes;

/**
 * Gets the display label for the specified taxon type code
 * @param {*} taxonTypeCode
 */
export const getTaxonTypeLabel = (taxonTypeCode) => {
  const taxonTypeLabel = taxonTypes.reduce((acc, taxonType) => {
    if (taxonType.value === taxonTypeCode) {
      // eslint-disable-next-line no-param-reassign
      acc = taxonType;
    }
    return acc;
  }, null);

  if (taxonTypeLabel && taxonTypeLabel.label) {
    return taxonTypeLabel.label;
  }

  return "";
};
