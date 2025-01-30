/* eslint-disable import/no-unresolved */
import React, { useLayoutEffect } from 'react';

import NeonContext from 'portal-core-components/lib/components/NeonContext';
import NeonPage from 'portal-core-components/lib/components/NeonPage';
import DownloadDataContext from 'portal-core-components/lib/components/DownloadDataContext';
import ReleaseFilter from 'portal-core-components/lib/components/ReleaseFilter';

import RouteService from 'portal-core-components/lib/service/RouteService';

import { isStringNonEmpty } from 'portal-core-components/lib/util/typeUtil';

import DataProductContext from './DataProductContext';

import SkeletonSection from './Sections/SkeletonSection';
import AboutSection from './Sections/AboutSection';
import DocumentationSection from './Sections/DocumentationSection';
import IssueLogSection from './Sections/IssueLogSection';
import AvailabilitySection from './Sections/AvailabilitySection';
import VisualizationsSection from './Sections/VisualizationsSection';

import ReleaseCard from './Release/ReleaseCard';
import TombstoneNotice from './Release/TombstoneNotice';

const {
  APP_STATUS,
  useDataProductContextState,
  getCurrentProductFromState,
} = DataProductContext;

const DataProductPage = () => {
  const [state, dispatch] = useDataProductContextState();
  const [{ data: neonContextData }] = NeonContext.useNeonContextState();
  const product = getCurrentProductFromState(state);
  const {
    app: { status: appStatus, error: appError },
    route: {
      productCode,
      release: currentRelease,
      bundle: {
        doiProductCode,
        parentCodes,
      },
    },
    data: {
      releases,
      aopVizProducts,
      productReleaseDois,
    },
  } = state;
  const {
    timeSeriesDataProducts: timeSeriesDataProductsJSON = { productCodes: [] },
  } = neonContextData;
  const { productCodes: timeSeriesProductCodes } = timeSeriesDataProductsJSON;

  // Set loading and error page props
  let loading = null;
  let error = null;
  const loadType = currentRelease ? 'data product release' : 'data product';
  switch (appStatus) {
    case APP_STATUS.READY:
      break;
    case APP_STATUS.ERROR:
      error = appError
        ? (
          <>
            <div>{`Error loading ${loadType}`}</div>
            <div>{appError}</div>
          </>
        ) : (
          <div>{`Error: ${loadType} not found`}</div>
        );
      break;
    default:
      loading = `Loading ${loadType}...`;
      break;
  }
  const skeleton = loading || error;

  // Set page title and breadcrumbs
  let title = 'Data Product';

  const breadcrumbs = [
    { name: 'Data & Samples', href: RouteService.getDataSamplesPath() },
    { name: 'Data Portal', href: RouteService.getDataSamplesDataPath() },
    { name: 'Explore Data Products', href: RouteService.getDataProductExplorePath() },
  ];
  if (productCode) {
    if (currentRelease) {
      breadcrumbs.push({ name: productCode, href: RouteService.getProductDetailPath(productCode) });
      breadcrumbs.push({ name: currentRelease });
    } else {
      breadcrumbs.push({ name: productCode });
    }
    title = product ? product.productName : productCode;
  }

  // Define the release filter node
  let releaseFilterProps = { skeleton: true };
  if (appStatus === APP_STATUS.READY && product) {
    releaseFilterProps = {
      releases,
      selected: currentRelease,
      showGenerationDate: true,
      showReleaseLink: true,
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

  const isTombstoned = DataProductContext.determineTombstoned(productReleaseDois, currentRelease);
  const isVizProduct = (timeSeriesProductCodes.includes(productCode)
    || aopVizProducts.includes(productCode));
  const isBundleChild = (parentCodes.length > 0)
    && (isStringNonEmpty(doiProductCode) || Array.isArray(doiProductCode));
  const showVizSection = !isTombstoned && (isVizProduct && !isBundleChild);

  // Establish sidebar links mapping to sections
  const sidebarLinks = [
    {
      name: 'About',
      hash: '#about',
      component: AboutSection,
    },
    {
      name: 'Documentation',
      hash: '#documentation',
      component: DocumentationSection,
    },
    {
      name: 'Issue Log',
      hash: '#issueLog',
      component: IssueLogSection,
    },
    {
      name: 'Availability and Download',
      hash: '#availabilityAndDownload',
      component: AvailabilitySection,
    },
  ];
  if (showVizSection) {
    sidebarLinks.push({
      name: 'Visualizations',
      hash: '#visualizations',
      component: VisualizationsSection,
    });
  }
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
      breadcrumbHomeHref={RouteService.getWebHomePath()}
      breadcrumbs={breadcrumbs}
      sidebarLinks={sidebarLinks}
      sidebarSubtitle={productCode || '--'}
      sidebarLinksAdditionalContent={sidebarLinksAdditionalContent}
      data-currentRelease={currentRelease}
      loading={loading}
      error={error}
      NeonContextProviderProps={{
        whenFinal: (neonContextState) => {
          dispatch({ type: 'storeFinalizedNeonContextState', neonContextState });
        },
      }}
    >
      {skeleton ? renderPageContents() : (
        <DownloadDataContext.Provider
          productData={downloadProductData}
          availabilityView="sites"
          release={currentRelease}
          key={currentRelease || ''}
        >
          <TombstoneNotice />
          <ReleaseCard />
          {renderPageContents()}
        </DownloadDataContext.Provider>
      )}
    </NeonPage>
  );
};

export default DataProductPage;
