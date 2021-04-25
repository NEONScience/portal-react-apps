import { DataProductBundle, DataProductParent } from '../types/store';

export const findBundle = (
  bundles: DataProductBundle[],
  productCode: string,
): DataProductBundle|undefined => (
  bundles.find((checkBundle: DataProductBundle): boolean => (
    checkBundle.productCode.localeCompare(productCode) === 0
  ))
);
export const findForwardParent = (bundle: DataProductBundle): DataProductParent|undefined => (
  bundle.parentProducts.find((checkParent: DataProductParent): boolean => (
    checkParent.forwardAvailability
  ))
);

export const findForwardChildren = (bundles: DataProductBundle[]): { [key: string]: string } => {
  const productCodes: { [key: string]: string } = {};
  bundles.forEach((bundle: DataProductBundle): void => {
    const parent: DataProductParent|undefined = findForwardParent(bundle);
    if (parent) {
      productCodes[bundle.productCode] = parent.parentProductCode;
    }
  });
  return productCodes;
};

const BundleUtil = {
  findBundle,
  findForwardParent,
  findForwardChildren,
};

export default BundleUtil;
