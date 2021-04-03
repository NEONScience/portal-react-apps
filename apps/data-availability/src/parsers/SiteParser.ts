import { UnknownRecord } from 'portal-core-components/lib/types/core';
import { exists, existsNonEmpty } from 'portal-core-components/lib/util/typeUtil';

import { AjaxResponse } from 'rxjs/ajax';
import { Site } from '../types/store';
import { resolveAny } from '../util/typeUtil';

const SiteParser = {
  parseSites: (response: AjaxResponse): Site[] => {
    const resolved: UnknownRecord = resolveAny(response as never, 'data');
    if (!exists(resolved.sites)) {
      return [];
    }
    return SiteParser.parseSitesList(resolved.sites as UnknownRecord[]);
  },
  parseSitesList: (sites: UnknownRecord[]): Site[] => {
    if (!existsNonEmpty(sites)) {
      return [];
    }
    return sites.map((site: UnknownRecord): Site => (
      SiteParser.parseSite(site)
    ));
  },
  parseSite: (site: UnknownRecord): Site => ({
    siteCode: site.siteCode as string,
    siteDescription: site.siteDescription as string,
    siteLatitude: site.siteLatitude as number,
    siteLongitude: site.siteLongitude as number,
    domainCode: site.domainCode as string,
    stateCode: site.stateCode as string,
  }),
};

export default SiteParser;
