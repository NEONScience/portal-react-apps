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
import { DataProduct, DataProductBundle, DataProductParent } from '../types/store';
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
    siteCodes: exists(product.siteCodes)
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
};

export default ProductParser;
