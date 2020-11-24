/* eslint-disable import/no-unresolved */
import React, { useLayoutEffect } from 'react';

import { makeStyles } from '@material-ui/core/styles';

import NeonPage from 'portal-core-components/lib/components/NeonPage';
import DownloadDataContext from 'portal-core-components/lib/components/DownloadDataContext';
import ReleaseFilter from 'portal-core-components/lib/components/ReleaseFilter';
import Theme from 'portal-core-components/lib/components/Theme';

import DataProductContext from './DataProductContext';
import SkeletonSection from './Sections/SkeletonSection';

import AboutSection from './Sections/AboutSection';
import CollectionAndProcessingSection from './Sections/CollectionAndProcessingSection';
import AvailabilitySection from './Sections/AvailabilitySection';
import VisualizationsSection from './Sections/VisualizationsSection';

const {
  APP_STATUS,
  useDataProductContextState,
  getCurrentProductFromState,
} = DataProductContext;

const useStyles = makeStyles(theme => ({
  releaseSubtitle: {
    fontSize: '1.6rem',
    fontWeight: 600,
    color: theme.palette.grey[600],
  },
}));

const DataProductPage = () => {
  const classes = useStyles(Theme);

  const [state, dispatch] = useDataProductContextState();
  const product = getCurrentProductFromState(state);
  const {
    app: { status: appStatus, error: appError },
    route: { productCode, release: currentRelease },
  } = state;

  // Set loading and error page props
  let loading = null;
  let error = null;
  const loadType = currentRelease ? 'data product release' : 'data product';
  switch (appStatus) {
    case APP_STATUS.READY:
      break;
    case APP_STATUS.ERROR:
      error = appError
        ? `Error loading ${loadType}: ${appError}`
        : `Error: ${loadType} not found`;
      break;
    default:
      loading = `Loading ${loadType}...`;
      break;
  }
  const skeleton = loading || error;

  // Set page title and breadcrumbs
  let title = 'Data Product';
  const breadcrumbs = [
    { name: 'Data Products', href: '/data-products/explore' },
  ];
  if (productCode) {
    if (currentRelease) {
      breadcrumbs.push({ name: productCode, href: `/data-products/${productCode}` });
      breadcrumbs.push({ name: currentRelease });
    } else {
      breadcrumbs.push({ name: productCode });
    }
    title = product ? product.productName : productCode;
  }

  // Define the release filter node
  const releases = appStatus === APP_STATUS.READY && product && Array.isArray(product.dois)
    ? [...product.dois]
    : null;
  let releaseFilterProps = { skeleton: true };
  if (appStatus === APP_STATUS.READY && product) {
    releaseFilterProps = {
      releases,
      selected: currentRelease,
      onChange: (value) => {
        const newRelease = value === 'n/a' ? null : value;
        dispatch({ type: 'setNextRelease', release: newRelease });
      },
    };
  }
  const sidebarLinksAdditionalContent = (
    <ReleaseFilter {...releaseFilterProps} key={currentRelease} />
  );

  // Effect - Keep the browser document title up to date with the state-generated title
  useLayoutEffect(() => {
    document.title = currentRelease
      ? `NEON | ${title} | Release ${currentRelease}`
      : `NEON | ${title}`;
  }, [title, currentRelease]);

  // Establish sidebar links mapping to sections
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
  const renderPageContents = () => sidebarLinks.map((link) => {
    const Component = skeleton ? SkeletonSection : link.component;
    return (
      <Component key={link.hash} hash={link.hash} name={link.name} />
    );
  });

  const downloadProductData = DataProductContext.getCurrentProductFromState(state, true);

  return (
    <NeonPage
      title={title}
      subtitle={!currentRelease ? null : (
        <span className={classes.releaseSubtitle}>
          {`Release ${currentRelease}`}
        </span>
      )}
      breadcrumbs={breadcrumbs}
      sidebarLinks={sidebarLinks}
      sidebarSubtitle={productCode || '--'}
      sidebarLinksAdditionalContent={sidebarLinksAdditionalContent}
      data-currentRelease={currentRelease}
      loading={loading}
      error={error}
    >
      {skeleton ? renderPageContents() : (
        <DownloadDataContext.Provider
          productData={downloadProductData}
          availabilityView="sites"
        >
          {renderPageContents()}
        </DownloadDataContext.Provider>
      )}
    </NeonPage>
  );
};

export default DataProductPage;
