import React, {
  useEffect,
  useContext,
  useLayoutEffect,
} from 'react';

import { makeStyles } from '@material-ui/core/styles';

import NeonPage from 'portal-core-components/lib/components/NeonPage';
import DownloadDataContext from 'portal-core-components/lib/components/DownloadDataContext';
// eslint-disable-next-line import/no-unresolved
import ReleaseFilter from 'portal-core-components/lib/components/ReleaseFilter';
import Theme from 'portal-core-components/lib/components/Theme';

import DataProductContext from './components/DataProductContext';
import SkeletonSection from './Sections/SkeletonSection';
import AboutSection from './Sections/AboutSection';
import CollectionAndProcessingSection from './Sections/CollectionAndProcessingSection';
import AvailabilitySection from './Sections/AvailabilitySection';
import VisualizationsSection from './Sections/VisualizationsSection';

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

  const { state, dispatch } = DataProductContext.useDataProductContextState();
  const { product, releases, currentRelease } = state;

  const breadcrumbs = [
    { name: 'Data Products', href: '/data-products/explore' },
  ];
  if (product) {
    breadcrumbs.push({ name: product ? product.productCode : '--' });
  }

  /*
    const getPageTitle = (state) => {
    const { product, currentRelease } = state;
    if (!product || !product.productName) { return 'NEON | Data Product'; }
    const baseTitle = `NEON | ${product.productName}`;
    return (!currentRelease ? baseTitle : `${baseTitle} | Release ${currentRelease}`);
    };
  */
  const title = product ? product.productName : null;

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
    If the page has loaded successfully then append the product name and release to the page title
  */
  useLayoutEffect(() => {
    document.title = getPageTitle(state);
  }, [state]);

  useEffect(() => {
    const handleNav = () => {
      console.log('NAV', document.location.pathName);
      const [, release] = getProductCodeAndCurrentReleaseFromURL();
      if (release !== currentRelease) {
        actions.setRelease(release || 'n/a');
      }
    };
    window.addEventListener('popstate', handleNav, false);
    return () => {
      window.removeEventListener('popstate', handleNav, false);
    };
  });

  const renderPageContents = () => sidebarLinks.map((link) => {
    const Component = skeleton ? SkeletonSection : link.component;
    return <Component key={link.hash} hash={link.hash} name={link.name} />;
  });

  const downloadContextProductData = state.bundleParent ? state.bundleParent : product;

  const releaseFilter = skeleton ? (
    <ReleaseFilter skeleton />
  ) : (
    <div>
      <ReleaseFilter
        releases={releases}
        selected={currentRelease}
        onChange={(newRelease) => { actions.setRelease(newRelease); }}
      />
    </div>
  );

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
      sidebarLinksAdditionalContent={releaseFilter}
      sidebarSubtitle={product ? product.productCode : '--'}
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
DataProductPage.defaultProps = NeonPage.defaultProps;

export default DataProductPage;
