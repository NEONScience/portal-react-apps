import BundleService from 'portal-core-components/lib/service/BundleService';

import { DataProductBundle, DataProductParent } from '../types/store';

export const determineBundle = (
  bundles: Record<string, DataProductBundle[]>,
  release: string|null|undefined,
): DataProductBundle[] => {
  const defaultBundle = (bundles.PROVISIONAL ? bundles.PROVISIONAL : []);
  const appliedRelease = BundleService.determineBundleRelease(release || '');
  return bundles[appliedRelease]
    ? bundles[appliedRelease]
    : defaultBundle;
};

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
  determineBundle,
  findBundle,
  findForwardParent,
  findForwardChildren,
};

export default BundleUtil;
