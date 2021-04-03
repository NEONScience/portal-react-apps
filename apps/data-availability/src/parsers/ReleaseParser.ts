import { UnknownRecord } from 'portal-core-components/lib/types/core';
import { existsNonEmpty } from 'portal-core-components/lib/util/typeUtil';

import { AjaxResponse } from 'rxjs/ajax';
import { DataProduct, Release } from '../types/store';
import { resolveAny } from '../util/typeUtil';

const ReleaseParser = {
  parseReleases: (response: AjaxResponse): Release[] => {
    const resolved: UnknownRecord = resolveAny(response as never, 'data');
    if (!Array.isArray(resolved)) {
      return [];
    }
    return ReleaseParser.parseReleaseList(resolved as UnknownRecord[]);
  },
  parseReleaseList: (releases: UnknownRecord[]): Release[] => {
    if (!existsNonEmpty(releases)) {
      return [];
    }
    return releases.map((release: UnknownRecord): Release => (
      ReleaseParser.parseRelease(release)
    ));
  },
  parseRelease: (release: UnknownRecord): Release => ({
    release: release.release as string,
    generationDate: release.generationDate as string,
    dataProducts: !existsNonEmpty(release.dataProducts as never)
      ? []
      : (release.dataProducts as UnknownRecord[])
        .map((dataProduct: UnknownRecord): DataProduct => ({
          productCode: dataProduct.productCode as string,
          productName: dataProduct.productName as string,
          siteCodes: [],
        })),
  }),
};

export default ReleaseParser;
