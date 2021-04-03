import { Nullable, UnknownRecord } from 'portal-core-components/lib/types/core';
import { exists, existsNonEmpty } from 'portal-core-components/lib/util/typeUtil';

import { AjaxResponse } from 'rxjs/ajax';
import { DataProduct } from '../types/store';
import { resolveAny } from '../util/typeUtil';

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
  parseProductResponse: (response: AjaxResponse): Nullable<DataProduct> => {
    const resolved: UnknownRecord = resolveAny(response as never, 'data');
    if (!exists(resolved.product)) {
      return null;
    }
    return ProductParser.parseProduct(resolved.product as UnknownRecord);
  },
  parseProduct: (product: UnknownRecord): DataProduct => ({
    productCode: product.productCode as string,
    productName: product.productName as string,
    siteCodes: exists(product.siteCodes)
      ? product.siteCodes as Record<string, unknown>[]
      : [],
  }),
};

export default ProductParser;
