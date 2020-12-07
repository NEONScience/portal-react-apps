import React from 'react';

import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Grid from '@material-ui/core/Grid';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';

import BundleIcon from '@material-ui/icons/Archive';
import MoreIcon from '@material-ui/icons/KeyboardArrowRight';
import TimeSeriesIcon from '@material-ui/icons/ShowChartOutlined';
import ProductDetailsIcon from '@material-ui/icons/InfoOutlined';
import AopDataViewerIcon from '@material-ui/icons/SatelliteOutlined';

import DataProductAvailability from 'portal-core-components/lib/components/DataProductAvailability';
import DataThemeIcon from 'portal-core-components/lib/components/DataThemeIcon';
import DownloadDataButton from 'portal-core-components/lib/components/DownloadDataButton';
import DownloadDataContext from 'portal-core-components/lib/components/DownloadDataContext';
import NeonEnvironment from 'portal-core-components/lib/components/NeonEnvironment';
import Theme from 'portal-core-components/lib/components/Theme';

import ExploreContext from '../ExploreContext';

import {
  FILTER_KEYS,
  VISUALIZATIONS,
  LATEST_AND_PROVISIONAL,
  getCurrentProductsByRelease,
} from '../util/filterUtil';

const useStyles = makeStyles(theme => ({
  productCard: {
    marginBottom: theme.spacing(3),
  },
  productName: {
    fontWeight: 600,
  },
  productCode: {
    color: theme.palette.grey[300],
  },
  release: {
    color: Theme.colors.BROWN[500],
    marginLeft: theme.spacing(2),
  },
  descriptionButton: {
    fontSize: theme.spacing(1.5),
    padding: theme.spacing(0.25, 1),
    backgroundColor: '#fff',
  },
  productPaperButton: {
    width: '100%',
    whiteSpace: 'nowrap',
    marginBottom: theme.spacing(1.5),
    borderColor: theme.palette.primary.main,
    '& span': {
      pointerEvents: 'none',
    },
  },
  moreLink: {
    cursor: 'pointer',
    marginLeft: theme.spacing(0.25),
    whiteSpace: 'nowrap',
  },
  moreIcon: {
    marginBottom: '-3px',
    fontSize: theme.spacing(2),
  },
  startFlex: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  card: {
    marginBottom: theme.spacing(2),
    backgroundColor: theme.colors.GOLD[50],
    borderColor: theme.colors.GOLD[300],
  },
  cardContent: {
    display: 'flex',
    alignItems: 'center',
    padding: '16px !important',
  },
  cardIcon: {
    color: theme.colors.GOLD[700],
    marginRight: theme.spacing(2),
  },
  detailSubtitle: {
    marginBottom: theme.spacing(1),
  },
}));

const DataProduct = React.memo((props) => {
  const classes = useStyles(Theme);

  const { productCode, highestOrderDownloadSubject } = props;

  const [state, dispatch] = ExploreContext.useExploreContextState();
  const {
    productDescriptionExpanded,
    aopVizProducts,
    neonContextState,
    currentProducts: { release: currentRelease },
  } = state;
  const products = getCurrentProductsByRelease(state);

  if (!products[productCode]) { return null; }

  const productData = products[productCode];
  let bundleParentProductData = null;
  const { isChild, hasManyParents, parent } = productData.bundle;
  if (isChild && parent) {
    bundleParentProductData = hasManyParents
      ? parent.map((parentCode) => products[parentCode])
      : products[parent];
  }
  
  const isAopViewerProduct = aopVizProducts.includes(productCode);
  const descriptionExpanded = productDescriptionExpanded[productCode];

  const {
    bundle,
    themes,
    productName,
    productDescription: rawProductDescription,
  } = productData;

  const productDescription = rawProductDescription ? rawProductDescription : '--';

  const {
    timeSeriesDataProducts: timeSeriesDataProductsJSON = { productCodes: [] },
  } = neonContextState.data;
  const { productCodes: timeSeriesProductCodes } = timeSeriesDataProductsJSON;

  const isBundleChild = bundle.isChild && bundleParentProductData;
  let siteCodes = [];
  if (isBundleChild) {
    siteCodes = bundle.forwardAvailability && !Array.isArray(bundleParentProductData)
      ? bundleParentProductData.siteCodes
      : [];
  } else {
    siteCodes = productData.siteCodes;
  }

  const productDateRange = productData.filterableValues[FILTER_KEYS.DATE_RANGE];

  const productHref = currentRelease === LATEST_AND_PROVISIONAL
    ? `${NeonEnvironment.getHost()}/data-products/${productCode}`
    : `${NeonEnvironment.getHost()}/data-products/${productCode}/${currentRelease}`;
  
  const hasData = siteCodes && (siteCodes.length > 0);
  const hasTimeSeriesData = hasData && timeSeriesProductCodes.includes(productCode);

  const hasVisualization = hasTimeSeriesData || isAopViewerProduct;

  let timeRange = null;
  if (hasData) {
    timeRange = productDateRange[0]
      ? `${productDateRange[0]} through ${productDateRange[productDateRange.length - 1]}`
      : 'Pending';
  }

  const name = (
    <Typography variant="h6" className={classes.productName}>
      <Link href={productHref} target="_blank">
        {productName}
      </Link>
    </Typography>
  );

  const code = (
    <div className={classes.startFlex}>
      <Typography className={classes.productCode} title="Product ID" variant="subtitle2">
        {productCode}
      </Typography>
      {currentRelease === LATEST_AND_PROVISIONAL ? null : (
        <Typography className={classes.release} title="Release" variant="subtitle2">
          {`Release: ${currentRelease}`}
        </Typography>
      )}
    </div>
  );

  const truncatedDescription = productDescription.replace(/^(.{200}[^\s,.-]*).*/, '$1');
  const showTruncatedDescription = !descriptionExpanded
    && truncatedDescription !== productDescription
    && productDescription.length > 325;
  const description = (
    <Typography variant="body2" style={{ marginTop: Theme.spacing(1) }}>
      {showTruncatedDescription ? (
        <React.Fragment>
          {`${truncatedDescription}… `}
          <Link
            className={classes.moreLink}
            onClick={() => dispatch({ type: 'expandProductDescription', productCode })}
          >
            More
            <MoreIcon fontSize="small" className={classes.moreIcon} />
          </Link>
        </React.Fragment>
      ) : productDescription}
    </Typography>
  );

  const getParentProductLink = (parentProductData = {}) => (
    <Link
      href={`${NeonEnvironment.getHost()}/data-products/${parentProductData.productCode}`}
      target="_blank"
    >
      {`${parentProductData.productName} (${parentProductData.productCode})`}
    </Link>    
  );
  
  let bundleParentLink = null;
  if (isBundleChild) {
    bundleParentLink = !Array.isArray(bundleParentProductData)
      ? (
        <Typography variant="subtitle2">
          This data product is bundled into {getParentProductLink(bundleParentProductData)}
        </Typography>
      ) : (
        <React.Fragment>
          <Typography variant="subtitle2">
            This data product has been split and bundled into more than one parent data product:
          </Typography>
          <ul style={{ margin: Theme.spacing(1, 0) }}>
            {bundleParentProductData.map(bundleParentProduct => (
              <li key={bundleParentProduct.productCode}>
                {getParentProductLink(bundleParentProduct)}
              </li>
            ))}
          </ul>
        </React.Fragment>
      );
  }

  const bundleInfo = isBundleChild ? (
    <Card className={classes.card}>
      <CardContent className={classes.cardContent}>
        <BundleIcon fontSize="large" className={classes.cardIcon} />
        <div style={{ flexGrow: 1 }}>
          {bundleParentLink}
          <Typography variant="body2">
            {bundle.forwardAvailability ? (
              <React.Fragment>
                It is not available as a standalone download. Data availability shown
                below reflects availability of the entire bundle.
              </React.Fragment>
            ) : (
              <React.Fragment>
                It is not available as a standalone download.
                Data availability information and product download is only available through
                the parent {Array.isArray(bundleParentProductData) ? 'products' : 'product'}.
              </React.Fragment>
            )}
          </Typography>
        </div>
      </CardContent>
    </Card>
  ) : null;
  
  const downloadDataButton = hasData ? (
    <DownloadDataContext.Provider
      productData={isBundleChild ? bundleParentProductData : productData}
      stateObservable={() => highestOrderDownloadSubject.asObservable()}
      release={currentRelease === LATEST_AND_PROVISIONAL ? null : currentRelease}
    >
      <DownloadDataButton
        data-gtm="explore-data-products.download-data-button"
        data-selenium={`browse-data-products-page.products.${productCode}.download-data-button`}
        className={classes.productPaperButton}
      />
    </DownloadDataContext.Provider>
  ) : null;

  const handleChangeVisualization = component => dispatch({
    type: 'changeActiveDataVisualization',
    component,
    productCode,
  });
  
  const aopViewerButton = hasData && isAopViewerProduct && currentRelease === LATEST_AND_PROVISIONAL
    ? (
      <Button
        data-gtm="explore-data-products.aop-data-viewer-button"
        data-gtm-product-code={productCode}
        data-selenium={`browse-data-products-page.products.${productCode}.aop-data-viewer-button`}
        className={classes.productPaperButton}
        variant="outlined"
        color="primary"
        endIcon={<AopDataViewerIcon />}
        onClick={() => handleChangeVisualization(VISUALIZATIONS.AOP_DATA_VIEWER.key)}
      >
        {VISUALIZATIONS.AOP_DATA_VIEWER.name}
      </Button>
    ) : null;

  const viewTimeSeriesDataButton = hasTimeSeriesData && currentRelease === LATEST_AND_PROVISIONAL
    ? (
      <Button
        data-gtm="explore-data-products.view-time-series-button"
        data-gtm-product-code={productCode}
        data-selenium={`browse-data-products-page.products.${productCode}.view-time-series-button`}
        className={classes.productPaperButton}
        variant="outlined"
        color="primary"
        endIcon={<TimeSeriesIcon />}
        onClick={() => handleChangeVisualization(VISUALIZATIONS.TIME_SERIES_VIEWER.key)}
      >
        {VISUALIZATIONS.TIME_SERIES_VIEWER.name}
      </Button>
    ) : null;

  const productDetailsButton = (
    <Button
      data-gtm="explore-data-products.product-details-button"
      data-gtm-product-code={productCode}
      data-selenium={`browse-data-products-page.products.${productCode}.product-details-button`}
      className={classes.productPaperButton}
      variant="outlined"
      color="primary"
      endIcon={<ProductDetailsIcon />}
      style={{ marginBottom: 0 }}
      href={productHref}
      target="_blank"
    >
      Product Details
    </Button>
  );

  const themeIcons = (themes || []).sort().map(dataTheme => (
    <div key={dataTheme} style={{ marginRight: Theme.spacing(0.5) }}>
      <DataThemeIcon theme={dataTheme} size={4} />
    </div>
  ));

  return (
    <Card className={classes.productCard}>
      <CardContent data-selenium={`browse-data-products-page.product-card.${productCode}`}>
        <Grid container spacing={2} style={{ marginBottom: Theme.spacing(2) }}>
          <Grid item xs={12} sm={7} md={8} lg={9}>
            {name}
            {code}
            {description}
          </Grid>
          <Grid item xs={12} sm={5} md={4} lg={3}>
            {downloadDataButton}
            {productDetailsButton}
          </Grid>
        </Grid>

        {bundleInfo}

        <Grid container spacing={2} style={{ marginBottom: Theme.spacing(2) }}>
          {!timeRange ? null : (
            <Grid item xs={12} sm={4}>
              <Typography variant="subtitle2" className={classes.detailSubtitle}>
                Available Dates
              </Typography>
              <Typography variant="body2">
                {timeRange}
              </Typography>
            </Grid>
          )}
          {!timeRange && !hasVisualization ? null : (
            <Grid item xs={12} sm={4}>
              <Typography variant="subtitle2" className={classes.detailSubtitle}>
                Data Themes
              </Typography>
              <div style={{ display: 'flex' }}>
                {themeIcons}
              </div>
            </Grid>
          )}
          {!hasData || !hasVisualization || currentRelease !== LATEST_AND_PROVISIONAL ? null : (
            <Grid item xs={12} sm={4}>
              <Typography variant="subtitle2" className={classes.detailSubtitle}>
                Visualize Data
              </Typography>
              {viewTimeSeriesDataButton}
              {aopViewerButton}
            </Grid>
          )}
        </Grid>

        {hasData ? (
          <DataProductAvailability siteCodes={siteCodes} />
        ) : null}

      </CardContent>
    </Card>
  );
});

export default DataProduct;
