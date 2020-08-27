/**
 * Describes the process.env.NODE_ENV name
 */
export const EnvType = {
  DEV: "development",
  PROD: "production"
};

/**
* Determines if the current environment is DEV
*/
export const isDevEnv = () => {
  return (process.env.NODE_ENV === EnvType.DEV);
}

/**
* Determines if the current environment is PROD
*/
export const isProdEnv = () => {
  return (process.env.NODE_ENV === EnvType.PROD);
}

/**
* Getter for the API path environment constant
*/
export const getRootApiPath = () => {
  return process.env.REACT_APP_NEON_PATH_PUBLIC_API;
}
/**
* Getter for the products API endpoint name environment constant
*/
export const getProductsApiEndpointName = () => {
  return process.env.REACT_APP_NEON_ENDPOINT_PRODUCTS_API;
}
/**
* Getter for the sites API endpoint environment constant
*/
export const getSitesApiEndpointName = () => {
  return process.env.REACT_APP_NEON_ENDPOINT_SITES_API;
}
/**
* Getter for the samples API endpoint environment constant
*/
export const getSamplesApiEndpointName = () => {
  return process.env.REACT_APP_NEON_ENDPOINT_SAMPLES_API;
}
/**
* Getter for the manifest API path environment constant
*/
export const getManifestApiPath = () => {
  return process.env.REACT_APP_NEON_PATH_MANIFEST_API;
}
/**
* Getter for the download API path environment constant
*/
export const getDownloadApiPath = () => {
  return process.env.REACT_APP_NEON_PATH_DOWNLOAD_API;
}

/**
 * Getter for the data API path environment constant
 */
export const getDataApiPath = () => {
  return process.env.REACT_APP_NEON_PATH_DATA_API;
}

/**
 * Getter for the file naming conventions environment constant
 */
export const getFileNamingConventionsPath = () => {
  return process.env.REACT_APP_NEON_PATH_FILE_NAMING_CONVENTIONS;
}

/**
 * Getter for the allow prod host ovverride environment constant
 */
export const getAllowProdHostOverride = () => {
  return process.env.REACT_APP_NEON_ALLOW_PROD_HOST_OVERRIDE;
}

/**
 * Getter for the root host path override environment constant
 */
export const getHostPathOverride = () => {
  return process.env.REACT_APP_NEON_HOST_OVERRIDE;
}

/**
 * Gets the full products API path
 */
export const getFullProductsApiPath = () => {
  return getApiPath(getProductsApiEndpointName());
}

/**
 * Gets the full sites API path
 */
export const getFullSitesApiPath = () => {
  return getApiPath(getSitesApiEndpointName());
}

/**
 * Gets the full samples API path
 */
export const getFullSamplesApiPath = () => {
  return getApiPath(getSamplesApiEndpointName());
}

/**
 * Gets the full manifest API path
 */
export const getFullManifestApiPath = () => {
  return getHostPath(getManifestApiPath());
}

/**
 * Gets the full download API path
 */
export const getFullDownloadApiPath = () => {
  return getHostPath(getDownloadApiPath());
}

/**
 * Gets the full data API path
 */
export const getFullDataApiPath = () => {
  return getApiPath(getDataApiPath());
}

/**
 * Determines if the allow prod host override is set
 */
export const isAllowProdHostOverride = () => {
  return (getAllowProdHostOverride() === "true");
}


/**
 * Gets the full path to the file naming conventions page
 */
export const getFullFileNamingConventionsPath = () => {
  return getHostPath(getFileNamingConventionsPath());
}

/**
 * Gets the root host path
 * @param {path} path The path extension to append to the root path
 */
export const getHostPath = (path) => {
  if (!path) {
    path = "";
  }

  let hostPath = window.location.protocol + "//" + window.location.host;

  if ((isDevEnv() || isAllowProdHostOverride()) && getHostPathOverride()) {
    hostPath = getHostPathOverride();
  }

  return hostPath + path;
}

/**
* Gets the API path for the current window.location
* @param {path} path The path extension to append to the root path
*/
export const getApiPath = (path) => {
  if (!path) {
    path = "";
  }

  return getHostPath(null) + getRootApiPath() + path;
}
