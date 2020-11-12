export const getPageTitle = (state) => {
  const { product, currentRelease } = state;
  if (!product || !product.productName) { return 'NEON | Data Product'; }
  const baseTitle = `NEON | ${product.productName}`;
  return (!currentRelease ? baseTitle : `${baseTitle} | Release ${currentRelease}`);
};

export const getProductCodeAndCurrentReleaseFromURL = () => {
  const regex = /data-products\/(DP[0-9]{1}\.[0-9]{5}\.[0-9]{3})\/?([A-Z0-9.]+)?/g;
  const parse = regex.exec(window.location.pathname);
  if (parse === null) {
    return [null, null];
  }
  return [parse[1] || null, parse[2] || null];
};
