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
 * Getter for the API name environment constant
 */
export const getApiName = () => {
  return process.env.REACT_APP_NEON_API_NAME;
}
/**
 * Getter for the API version environment constant
 */
export const getApiVersion = () => {
  return process.env.REACT_APP_NEON_API_VERSION;
}
/**
 * Getter for the sites API path environment constant
 */
export const getSitesPath = () => {
  return process.env.REACT_APP_NEON_API_SITES_PATH;
}
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
 * Getter for the allow prod host ovverride environment constant
 */
export const getAllowProdHostOverride = () => {
  return process.env.REACT_APP_NEON_ALLOW_PROD_HOST_OVERRIDE;
  }
/**
 * Getter for the API root path override environment constant
 */
export const getApiRootPathOverride = () => {
  return process.env.REACT_APP_NEON_API_ROOT_PATH_OVERRIDE;
}

/**
 * Determines if the allow prod host override is set
 */
export const isAllowProdHostOverride = () => {
	return (getAllowProdHostOverride() === "true");
}

/**
 * Gets the API path for the current window.location
 * @param {path} path The path extension to append to the root path
 */
export const getApiPath = (path) => {
  if (!path) {
    path = "";
  }

	let rootPath = window.location.protocol + "//" + window.location.host;
	if ((isDevEnv() || isAllowProdHostOverride()) && getApiRootPathOverride()) {
    rootPath = getApiRootPathOverride();
  }

  rootPath = rootPath + "/" + getApiName() + "/" + getApiVersion();

  return rootPath + path;
}
