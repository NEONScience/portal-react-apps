/* eslint-disable import/no-unresolved */
import React, { useLayoutEffect } from 'react';

import moment from 'moment';

import { CopyToClipboard } from 'react-copy-to-clipboard';

import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import CopyIcon from '@material-ui/icons/Assignment';

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

import DetailTooltip from './Details/DetailTooltip';

const DOI_TOOLTIP = 'Digital Object Identifier (DOI) - A citable permanent link to this this data product release';

const {
  APP_STATUS,
  useDataProductContextState,
  getCurrentProductFromState,
  getCurrentReleaseObjectFromState,
} = DataProductContext;

const useStyles = makeStyles(theme => ({
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

  // Get the current release object if appropriate to do so
  const currentReleaseObject = getCurrentReleaseObjectFromState(state);
  let currentReleaseGenDate = null;
  if (currentReleaseObject) {
    const generationMoment = moment(currentReleaseObject.generationDate);
    currentReleaseGenDate = generationMoment ? generationMoment.format('MMMM D, YYYY') : null;
  }

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

  return (
    <NeonPage
      title={title}
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
          {!currentReleaseObject ? null : (
            <Card className={classes.card}>
              <CardContent>
                <div className={classes.flex}>
                  <Typography variant="h5" component="h2">
                    Release:&nbsp;
                    <b>{currentRelease}</b>
                  </Typography>
                  <CopyToClipboard text={currentReleaseObject.url}>
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
                </div>
                <Typography variant="body2" color="textSecondary" component="p">
                  <span className={classes.releaseAttribTitle}>Generated:</span>
                  <span className={classes.releaseAttribValue}>{currentReleaseGenDate}</span>
                </Typography>
                <Typography variant="body2" color="textSecondary" component="p">
                  <span className={classes.releaseAttribTitle}>DOI:</span>
                  <span className={classes.releaseAttribValue}>{currentReleaseObject.url}</span>
                  <DetailTooltip tooltip={DOI_TOOLTIP} />
                </Typography>
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
