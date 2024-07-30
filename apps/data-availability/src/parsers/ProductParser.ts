import { Nullable, UnknownRecord } from 'portal-core-components/lib/types/core';
import {
  ReleaseDataProductBundles,
  DataProductBundle as NeonDataProductBundle,
  BundledDataProduct,
} from 'portal-core-components/lib/types/neonApi';
import {
  exists,
  existsNonEmpty,
  isStringNonEmpty,
} from 'portal-core-components/lib/util/typeUtil';

import { AjaxResponse } from 'rxjs/ajax';
import {
  DataProduct,
  DataProductBundle,
  DataProductParent,
  DataProductReleaseDoi,
  DataProductReleaseTombAva,
} from '../types/store';
import { resolveAny } from '../util/typeUtil';

const ProductParser = {
  parseProducts: (response: AjaxResponse<unknown>): DataProduct[] => {
    const resolved: UnknownRecord = resolveAny(response as never, 'data');
    if (!exists(resolved.products)) {
      return [];
    }
    return ProductParser.parseProductsList(resolved.products as UnknownRecord[]);
  },
  parseProductsList: (products: UnknownRecord[]): DataProduct[] => {
    if (!existsNonEmpty(products)) {
      return [];
    }
    return products.map((product: UnknownRecord): DataProduct => (
      ProductParser.parseProduct(product)
    ));
  },
  parseProductResponse: (response: AjaxResponse<unknown>): Nullable<DataProduct[]> => {
    const resolved: UnknownRecord = resolveAny(response as never, 'data');
    if (!exists(resolved.products)) {
      return null;
    }
    return ProductParser.parseProductsList(
      resolved.products as UnknownRecord[],
    );
  },
  parseProduct: (product: UnknownRecord): DataProduct => ({
    productCode: product.productCode as string,
    productName: product.productName as string,
    productDescription: product.productDescription as string,
    productScienceTeam: isStringNonEmpty(product.productScienceTeam)
      ? product.productScienceTeam as string
      : 'Unspecified',
    siteCodes: (exists(product.siteCodes) && Array.isArray(product.siteCodes))
      ? product.siteCodes as Record<string, unknown>[]
      : [],
  }),

  parseBundles: (response: AjaxResponse<unknown>): Record<string, DataProductBundle[]> => {
    const data: unknown = resolveAny(response as never, 'data') as unknown;
    const hasData = exists(data) && Array.isArray(data);
    if (!hasData) {
      return {};
    }
    const bundles: Record<string, DataProductBundle[]> = {};
    const apiResponse: ReleaseDataProductBundles[] = data as ReleaseDataProductBundles[];
    apiResponse.forEach((releaseBundles: ReleaseDataProductBundles): void => {
      const { release, dataProductBundles } = releaseBundles;
      const parentLookup: Record<string, DataProductParent[]> = {};
      dataProductBundles.forEach((bundle: NeonDataProductBundle): void => {
        const {
          productCode: bundleProductCode,
          forwardAvailability,
          bundledProducts,
        } = bundle;
        const parent: DataProductParent = {
          parentProductCode: bundleProductCode,
          forwardAvailability,
        };
        bundledProducts.forEach((bundledProduct: BundledDataProduct): void => {
          const { productCode } = bundledProduct;
          if (!existsNonEmpty(parentLookup[productCode])) {
            parentLookup[productCode] = [parent];
          } else {
            parentLookup[productCode].push(parent);
          }
        });
      });
      const transformed: DataProductBundle[] = [];
      Object.keys(parentLookup).forEach((productCode: string): void => {
        const bundle: DataProductBundle = {
          productCode,
          parentProducts: parentLookup[productCode],
        };
        transformed.push(bundle);
      });
      bundles[release] = transformed;
    });
    return bundles;
  },

  parseProductReleaseDoi: (
    response: AjaxResponse<unknown>,
  ): Nullable<DataProductReleaseDoi|DataProductReleaseDoi[]> => {
    const resolved: UnknownRecord = resolveAny(response as never, 'data');
    if (!exists(resolved)) {
      return null;
    }
    if (!Array.isArray(resolved)) {
      return ProductParser.parseProductReleaseDoiRecord(resolved);
    }
    return resolved.map((r: UnknownRecord): DataProductReleaseDoi => (
      ProductParser.parseProductReleaseDoiRecord(r)
    ));
  },

  parseProductReleaseDoiRecord: (prdr: UnknownRecord): DataProductReleaseDoi => ({
    productCode: prdr.productCode as string,
    release: prdr.release as string,
    releaseGenerationDate: prdr.releaseGenerationDate as string,
    generationDate: prdr.generationDate as string,
    url: prdr.url as string,
    status: prdr.status as string,
  }),

  parseProductReleaseTombAva: (
    response: AjaxResponse<unknown>,
  ): Nullable<DataProductReleaseTombAva> => {
    const resolved: UnknownRecord = resolveAny(response as never, 'data');
    if (!exists(resolved)) {
      return null;
    }
    return {
      productCode: resolved.productCode as string,
      productName: resolved.productName as string,
      release: resolved.release as string,
      siteCodes: (exists(resolved.siteCodes) && Array.isArray(resolved.siteCodes))
        ? resolved.siteCodes as Record<string, unknown>[]
        : [],
    };
  },
};

export default ProductParser;
