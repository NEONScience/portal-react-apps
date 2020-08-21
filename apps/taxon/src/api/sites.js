import { getApiPath, getSitesPath } from "./environment"

/**
 * Gets the sites API endpoint path
 */
export const getSitesApiPath = () => {
  return getApiPath(getSitesPath());
}
