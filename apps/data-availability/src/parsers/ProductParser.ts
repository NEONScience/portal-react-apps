import { Nullable, UnknownRecord } from 'portal-core-components/lib/types/core';
import { exists, existsNonEmpty, isStringNonEmpty } from 'portal-core-components/lib/util/typeUtil';

import { AjaxResponse } from 'rxjs/ajax';
import { DataProduct, DataProductBundle, DataProductParent } from '../types/store';
import { resolveAny, isEmptyObject } from '../util/typeUtil';

const ProductParser = {
  parseProducts: (response: AjaxResponse): DataProduct[] => {
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
  parseProductResponse: (response: AjaxResponse): Nullable<DataProduct[]> => {
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

  parseBundles: (response: AjaxResponse): DataProductBundle[] => {
    const children: UnknownRecord = resolveAny(response as never, 'children');
    const parents: UnknownRecord = resolveAny(response as never, 'parents');
    const hasChildren = exists(children)
      && !isEmptyObject(children)
      && (typeof children === 'object');
    const hasParents = exists(parents)
      && !isEmptyObject(parents)
      && (typeof parents === 'object');
    if (!hasChildren || !hasParents) {
      return [];
    }
    const bundles: DataProductBundle[] = [];
    Object.keys(children)
      .forEach((childKey: string): void => {
        const parentProducts: DataProductParent[] = [];
        if (isStringNonEmpty(children[childKey])) {
          const forwardAvailability: boolean = Object.keys(parents)
            .some((parentKey: string): boolean => {
              if ((children[childKey] as string).localeCompare(parentKey) !== 0) {
                return false;
              }
              return (parents[parentKey] as Record<string, boolean>).forwardAvailability;
            });
          parentProducts.push({
            parentProductCode: children[childKey] as string,
            forwardAvailability,
          });
        } else {
          const parent = children[childKey] as Record<string, Record<string, boolean>>;
          Object.keys(parent)
            .forEach((parentKey: string): void => {
              const forwardAvailability: boolean = Object.keys(parents)
                .some((parentKeyForward: string): boolean => {
                  if (parentKey.localeCompare(parentKeyForward) !== 0) {
                    return false;
                  }
                  return (parents[parentKeyForward] as Record<string, boolean>).forwardAvailability;
                });
              parentProducts.push({
                parentProductCode: parentKey,
                forwardAvailability,
              });
            });
        }
        bundles.push({
          productCode: childKey,
          parentProducts,
        });
      });
    return bundles;
  },
};

export default ProductParser;
