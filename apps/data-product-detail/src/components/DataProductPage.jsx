import React, {
  useContext,
  useLayoutEffect,
} from 'react';

import NeonPage from 'portal-core-components/lib/components/NeonPage';
import DownloadDataContext from 'portal-core-components/lib/components/DownloadDataContext';

import SkeletonSection from './Sections/SkeletonSection';
import AboutSection from './Sections/AboutSection';
import CollectionAndProcessingSection from './Sections/CollectionAndProcessingSection';
import AvailabilitySection from './Sections/AvailabilitySection';
import VisualizationsSection from './Sections/VisualizationsSection';
// import ContentsSection from './Sections/ContentsSection';
// import UsageSection from './Sections/UsageSection';

import { StoreContext } from '../Store';

const DataProductPage = (props) => {
  const { loading, error } = props;
  const skeleton = loading || error;

  const { state } = useContext(StoreContext);

  const breadcrumbs = [
    { name: 'Data Products', href: '/data-products/explore' },
  ];
  if (state.product) {
    breadcrumbs.push({ name: state.product.productCode });
  }

  const title = state.product ? state.product.productName : null;

  const sidebarLinks = [
    {
      name: 'About',
      hash: '#about',
      component: AboutSection,
    },
    {
      name: 'Collection and Processing',
      hash: '#collectionAndProcessing',
      component: CollectionAndProcessingSection,
    },
    {
      name: 'Availability and Download',
      hash: '#availabilityAndDownload',
      component: AvailabilitySection,
    },
    {
      name: 'Visualizations',
      hash: '#visualizations',
      component: VisualizationsSection,
    },
  ];

  /*
    If the page has loaded successfully then append the product name to the page title
  */
  useLayoutEffect(() => {
    if (loading || error || !state.product) { return; }
    document.title = `NEON | ${state.product.productName}`;
  }, [loading, error]); // eslint-disable-line react-hooks/exhaustive-deps

  const renderPageContents = () => sidebarLinks.map((link) => {
    const Component = skeleton ? SkeletonSection : link.component;
    return <Component key={link.hash} hash={link.hash} name={link.name} />;
  });

  const downloadContextProductData = state.bundleParent ? state.bundleParent : state.product;
  return (
    <NeonPage
      {...props}
      title={title}
      breadcrumbs={breadcrumbs}
      sidebarLinks={sidebarLinks}
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
DataProductPage.defaultProps = NeonPage.defaultProps;

export default DataProductPage;
