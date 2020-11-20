import React, { useLayoutEffect } from 'react';
import PropTypes from 'prop-types';

import { makeStyles } from '@material-ui/core/styles';

import NeonPage from 'portal-core-components/lib/components/NeonPage';
import DownloadDataContext from 'portal-core-components/lib/components/DownloadDataContext';
import Theme from 'portal-core-components/lib/components/Theme';

import DataProductContext from './DataProductContext';
import SkeletonSection from './Sections/SkeletonSection';

import AboutSection from './Sections/AboutSection';
/*
import CollectionAndProcessingSection from './Sections/CollectionAndProcessingSection';
import AvailabilitySection from './Sections/AvailabilitySection';
import VisualizationsSection from './Sections/VisualizationsSection';
*/

const useStyles = makeStyles(theme => ({
  releaseSubtitle: {
    fontSize: '1.6rem',
    fontWeight: 600,
    color: theme.palette.grey[600],
  },
}));

const DataProductPage = (props) => {
  const { loading, error } = props;
  const skeleton = loading || error;

  const classes = useStyles(Theme);

  const [state] = DataProductContext.useDataProductContextState();
  const {
    route: { productCode, release: currentRelease },
    data: { product: generalProduct, productReleases },
  } = state;

  let product = null;
  let title = 'Data Product';

  const breadcrumbs = [
    { name: 'Data Products', href: '/data-products/explore' },
  ];
  if (productCode) {
    if (currentRelease) {
      breadcrumbs.push({ name: productCode, href: `/data-products/${productCode}` });
      breadcrumbs.push({ name: currentRelease });
      product = productReleases[currentRelease];
    } else {
      breadcrumbs.push({ name: productCode });
      product = generalProduct;
    }
    title = product ? product.productName : productCode;
  }

  // Effeft - Keep the browser document title up to date with the state-generated title
  useLayoutEffect(() => {
    document.title = currentRelease
      ? `NEON | ${title} | Release ${currentRelease}`
      : `NEON | ${title}`;
  }, [title, currentRelease]);

  const sidebarLinks = [
    {
      name: 'About',
      hash: '#about',
      component: AboutSection,
    },
    {
      name: 'Collection and Processing',
      hash: '#collectionAndProcessing',
      component: SkeletonSection,
      // component: CollectionAndProcessingSection,
    },
    {
      name: 'Availability and Download',
      hash: '#availabilityAndDownload',
      component: SkeletonSection,
      // component: AvailabilitySection,
    },
    {
      name: 'Visualizations',
      hash: '#visualizations',
      component: SkeletonSection,
      // component: VisualizationsSection,
    },
  ];
  const renderPageContents = () => sidebarLinks.map((link) => {
    const Component = skeleton ? SkeletonSection : link.component;
    return <Component key={link.hash} hash={link.hash} name={link.name} />;
  });

  const downloadContextProductData = state.bundleParent ? state.bundleParent : product;

  return (
    <NeonPage
      {...props}
      title={title}
      subtitle={!currentRelease ? null : (
        <span className={classes.releaseSubtitle}>
          {`Release ${currentRelease}`}
        </span>
      )}
      breadcrumbs={breadcrumbs}
      sidebarLinks={sidebarLinks}
      sidebarSubtitle={productCode || '--'}
      data-currentRelease={currentRelease}
    >
      {skeleton ? renderPageContents() : (
        <DownloadDataContext.Provider
          productData={downloadContextProductData}
          availabilityView="sites"
        >
          {renderPageContents()}
        </DownloadDataContext.Provider>
      )}
    </NeonPage>
  );
};

DataProductPage.propTypes = NeonPage.propTypes;
// eslint-disable-next-line react/forbid-foreign-prop-types
DataProductPage.propTypes.children = PropTypes.oneOfType([
  PropTypes.arrayOf(PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.string,
  ])),
  PropTypes.node,
  PropTypes.string,
]);
DataProductPage.defaultProps = NeonPage.defaultProps;
DataProductPage.defaultProps.children = null;

export default DataProductPage;
