/* eslint-disable import/no-unresolved */
import React, { useLayoutEffect } from 'react';

import moment from 'moment';

import { CopyToClipboard } from 'react-copy-to-clipboard';

import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Link from '@material-ui/core/Link';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import CopyIcon from '@material-ui/icons/Assignment';

import NeonPage from 'portal-core-components/lib/components/NeonPage';
import DownloadDataContext from 'portal-core-components/lib/components/DownloadDataContext';
import ReleaseFilter from 'portal-core-components/lib/components/ReleaseFilter';
import Theme from 'portal-core-components/lib/components/Theme';

import RouteService from 'portal-core-components/lib/service/RouteService';

import DataProductContext from './DataProductContext';

import SkeletonSection from './Sections/SkeletonSection';
import AboutSection from './Sections/AboutSection';
import CollectionAndProcessingSection from './Sections/CollectionAndProcessingSection';
import AvailabilitySection from './Sections/AvailabilitySection';
import VisualizationsSection from './Sections/VisualizationsSection';

import DetailTooltip from './Details/DetailTooltip';

const DOI_TOOLTIP = 'Digital Object Identifier (DOI) - A citable, permanent link to this data product release';

const {
  APP_STATUS,
  useDataProductContextState,
  getCurrentProductFromState,
  getCurrentReleaseObjectFromState,
} = DataProductContext;

const useStyles = makeStyles((theme) => ({
  card: {
    backgroundColor: Theme.colors.BROWN[50],
    borderColor: Theme.colors.BROWN[300],
    marginBottom: theme.spacing(4),
  },
  flex: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(2),
  },
  copyButton: {
    backgroundColor: '#fff',
  },
  releaseAttribTitle: {
    marginRight: theme.spacing(1),
  },
  releaseAttribValue: {
    fontWeight: 600,
  },
  releaseInfoLink: {
    fontWeight: 600,
  },
  doiFromParentBlurb: {
    fontStyle: 'italic',
    fontSize: '0.8rem',
    marginTop: theme.spacing(1),
  },
}));

const DataProductPage = () => {
  const classes = useStyles(Theme);

  const [state, dispatch] = useDataProductContextState();
  const product = getCurrentProductFromState(state);
  const {
    app: { status: appStatus, error: appError },
    route: { productCode, release: currentRelease, bundle },
    data: { releases, bundleParentReleases },
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

  // Get the current release object if appropriate to do so
  const currentReleaseObject = getCurrentReleaseObjectFromState(state);
  const hideDoi = currentReleaseObject && !currentReleaseObject.showDoi;
  let currentReleaseGenDate = null;
  if (currentReleaseObject) {
    const generationMoment = moment(currentReleaseObject.generationDate);
    currentReleaseGenDate = generationMoment ? generationMoment.format('MMMM D, YYYY') : null;
  }
  const currentDoiUrl = (
    currentReleaseObject && currentReleaseObject.productDoi && currentReleaseObject.productDoi.url
      ? currentReleaseObject.productDoi.url
      : null
  );

  // Special handling for bundle children
  let doiUrlIsFromBundleParent = false;
  let bundleParentLink = null;
  if (currentDoiUrl && bundle.parentCodes.length) {
    doiUrlIsFromBundleParent = true;
    const bundleParentCode = bundle.parentCodes[0];
    const bundleParentData = (bundleParentReleases[bundleParentCode] || {})[currentRelease] || {};
    const { productName: bundleParentName } = bundleParentData;
    bundleParentLink = !Object.keys(bundleParentData).length ? null : (
      <Link
        href={RouteService.getProductDetailPath(bundleParentCode, currentRelease)}
      >
        {`${bundleParentName} (${bundleParentCode})`}
      </Link>
    );
  }

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
  const releaseInfoHref = !currentRelease
    ? null
    : RouteService.getReleaseDetailPath(currentRelease);
  const releaseInfoTooltip = !currentRelease ? null : (
    `Click to view general information about all data products in the ${currentRelease} release`
  );

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
          {!currentReleaseObject || hideDoi ? null : (
            <Card className={classes.card}>
              <CardContent>
                <div className={classes.flex}>
                  <Typography variant="h5" component="h2">
                    Release:&nbsp;
                    <Tooltip
                      placement="right"
                      title={releaseInfoTooltip}
                      className={classes.tooltip}
                    >
                      <Link href={releaseInfoHref} className={classes.releaseInfoLink}>
                        {currentRelease}
                      </Link>
                    </Tooltip>
                  </Typography>
                  {!currentDoiUrl ? null : (
                    <CopyToClipboard text={currentDoiUrl}>
                      <Button
                        color="primary"
                        variant="outlined"
                        size="small"
                        className={classes.copyButton}
                      >
                        <CopyIcon fontSize="small" />
                        Copy DOI
                      </Button>
                    </CopyToClipboard>
                  )}
                </div>
                <Typography variant="body2" color="textSecondary" component="p">
                  <span className={classes.releaseAttribTitle}>Generated:</span>
                  <span className={classes.releaseAttribValue}>{currentReleaseGenDate}</span>
                </Typography>
                {!currentDoiUrl ? null : (
                  <>
                    <Typography variant="body2" color="textSecondary" component="p">
                      <span className={classes.releaseAttribTitle}>DOI:</span>
                      <span className={classes.releaseAttribValue}>
                        {currentDoiUrl}
                      </span>
                      <DetailTooltip tooltip={DOI_TOOLTIP} />
                    </Typography>
                    {!doiUrlIsFromBundleParent ? null : (
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        component="p"
                        className={classes.doiFromParentBlurb}
                      >
                        {/* eslint-disable react/jsx-one-expression-per-line */}
                        <b>Note:</b> This product bundled into {bundleParentLink}. The above DOI
                        refers to that product release and there is no DOI directly associated with
                        this sub-product release.
                        {/* eslint-enable react/jsx-one-expression-per-line */}
                      </Typography>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          )}
          {renderPageContents()}
        </DownloadDataContext.Provider>
      )}
    </NeonPage>
  );
};

export default DataProductPage;
