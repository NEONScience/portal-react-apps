import NeonContext from 'portal-core-components/lib/components/NeonContext/NeonContext';
import { exists, isStringNonEmpty } from 'portal-core-components/lib/util/typeUtil';

import { Release } from '../types/store';

interface UserRelease {
  releaseTag: string;
  description: string;
  generationDate: number;
}

// eslint-disable-next-line import/prefer-default-export
export const useContextReleases = (currentReleases: Release[]): Release[] => {
  const [
    {
      auth: {
        userData: userDataProp,
      },
    },
  ] = NeonContext.useNeonContextState();
  const userData: Record<string, unknown> = (userDataProp as Record<string, unknown>);
  if (!exists(userData)
      || !exists(userData?.data)
      || !Array.isArray((userData?.data as Record<string, unknown>)?.releases)) {
    return currentReleases;
  }
  const data = (userData?.data as Record<string, unknown>);
  const releases: UserRelease[] = (data?.releases as UserRelease[]);
  releases.forEach((userRelease: UserRelease): void => {
    const hasRelease: boolean = currentReleases.some((value: Release): boolean => (
      exists(value)
      && isStringNonEmpty(value.release)
      && isStringNonEmpty(userRelease.releaseTag)
      && (value.release.localeCompare(userRelease.releaseTag) === 0)
    ));
    if (!hasRelease) {
      currentReleases.push({
        release: userRelease.releaseTag,
        generationDate: userRelease.generationDate
          ? new Date(userRelease.generationDate).toISOString()
          : new Date().toISOString(),
        dataProducts: [],
      });
    }
  });
  return currentReleases;
};
