import React from 'react';

import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Link from '@material-ui/core/Link';
import Paper from '@material-ui/core/Paper';
import SnackbarContent from '@material-ui/core/SnackbarContent';
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
import NeonContext from 'portal-core-components/lib/components/NeonContext';
import NeonEnvironment from 'portal-core-components/lib/components/NeonEnvironment';
import Theme from 'portal-core-components/lib/components/Theme';

import { FILTER_KEYS, VISUALIZATIONS } from '../../util/filterUtil';
import { DataVisualizationComponents } from '../../actions/actions';

const useStyles = makeStyles(theme => ({
  productCard: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  productName: {
    fontWeight: 600,
    marginBottom: theme.spacing(1),
  },
  descriptionButton: {
    fontSize: theme.spacing(1.5),
    padding: theme.spacing(0.25, 1),
    backgroundColor: '#fff',
  },
  productCardButton: {
    width: '100%',
    whiteSpace: 'nowrap',
    marginBottom: theme.spacing(1),
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
  infoSnackbar: {
    backgroundColor: theme.palette.grey[50],
    color: '#000',
    border: `1px solid ${theme.palette.primary.main}80`,
    margin: theme.spacing(0.5, 0, 3, 0),
    padding: theme.spacing(0, 2),
    '& div': {
      width: '100%',
    },
  },
  infoSnackbarIcon: {
    color: theme.palette.grey[300],
    marginRight: theme.spacing(2),
  },
  visualizationButton: {
    backgroundColor: `${theme.palette.grey[100]}bb`,
    '&:focus,&:hover,&active': {
      backgroundColor: `${theme.palette.grey[200]}bb`,
    },
  },
}));

const DataProduct = React.memo((props) => {
  const classes = useStyles(Theme);
  const {
    productData,
    bundleParentProductData,
    descriptionExpanded,
    isAopViewerProduct,
    onExpandProductDescription,
    onChangeActiveDataVisualization,
    highestOrderDownloadSubject,
  } = props;

  const {
    productCode,
    bundle,
    themes,
    productName,
    productDescription,
  } = productData;

  const [{ data: neonContextData }] = NeonContext.useNeonContextState();
  const { timeSeriesDataProducts: timeSeriesDataProductsJSON = { productCodes: [] } } = neonContextData;
  const { productCodes: timeSeriesProductCodes } = timeSeriesDataProductsJSON;

  const isBundleChild = bundle.isChild && bundleParentProductData;
  const siteCodes = isBundleChild ? bundleParentProductData.siteCodes : productData.siteCodes;

  const productDateRange = productData.filterableValues[FILTER_KEYS.DATE_RANGE];

  const productHref = `${NeonEnvironment.getHost()}/data-products/${productCode}`;

  const hasData = siteCodes && (siteCodes.length > 0);
  const hasTimeSeriesData = hasData && timeSeriesProductCodes.includes(productCode);

  const timeRange = productDateRange[0]
    ? `${productDateRange[0]} through ${productDateRange[productDateRange.length - 1]}`
    : 'Pending';

  const name = (
    <Typography variant="h6" className={classes.productName}>
      <Link href={productHref} target="_blank">
        {productName}
      </Link>
    </Typography>
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
          <Link className={classes.moreLink} onClick={() => onExpandProductDescription(productCode)}>
            More
            <MoreIcon fontSize="small" className={classes.moreIcon} />
          </Link>
        </React.Fragment>
      ) : productDescription}
    </Typography>
  );

  const bundleParentLink = isBundleChild ? (
    <Link
      href={`${NeonEnvironment.getHost()}/data-products/${bundleParentProductData.productCode}`}
      target="_blank"
    >
      {`${bundleParentProductData.productName} (${bundleParentProductData.productCode})`}
    </Link>
  ) : null;
  const bundleInfo = isBundleChild ? (
    <SnackbarContent
      className={classes.infoSnackbar}
      message={(
        <div className={classes.startFlex} style={{ width: '100%' }}>
          <BundleIcon fontSize="large" className={classes.infoSnackbarIcon} />
          <div style={{ flexGrow: 1 }}>
            <Typography variant="subtitle2">
              This data product is bundled into {bundleParentLink}
            </Typography>
            <Typography variant="body2">
              It is not available as a standalone download. Data availability shown
              below reflects availability of the entire bundle.
            </Typography>
          </div>
        </div>        
      )}
    />
  ) : null;
  
  const downloadDataButton = hasData ? (
    <DownloadDataContext.Provider
      productData={isBundleChild ? bundleParentProductData : productData}
      stateObservable={() => highestOrderDownloadSubject.asObservable()}
    >
      <DownloadDataButton
        data-gtm="explore-data-products.download-data-button"
        data-selenium={`browse-data-products-page.products.${productCode}.download-data-button`}
        className={classes.productCardButton}
      />
    </DownloadDataContext.Provider>
  ) : null;

  const aopViewerButton = hasData && isAopViewerProduct
    ? (
      <Button
        data-gtm="explore-data-products.aop-data-viewer-button"
        data-gtm-product-code={productCode}
        data-selenium={`browse-data-products-page.products.${productCode}.aop-data-viewer-button`}
        className={`${classes.productCardButton} ${classes.visualizationButton}`}
        variant="outlined"
        color="primary"
        endIcon={<AopDataViewerIcon />}
        onClick={() => onChangeActiveDataVisualization(DataVisualizationComponents.AOP, productCode)}
      >
        {VISUALIZATIONS.AOP_DATA_VIEWER.name}
      </Button>
    ) : null;

  const viewTimeSeriesDataButton = hasTimeSeriesData
    ? (
      <Button
        data-gtm="explore-data-products.view-time-series-button"
        data-gtm-product-code={productCode}
        data-selenium={`browse-data-products-page.products.${productCode}.view-time-series-button`}
        className={`${classes.productCardButton} ${classes.visualizationButton}`}
        variant="outlined"
        color="primary"
        endIcon={<TimeSeriesIcon />}
        onClick={() => onChangeActiveDataVisualization(DataVisualizationComponents.TIME_SERIES, productCode)}
      >
        {VISUALIZATIONS.TIME_SERIES_VIEWER.name}
      </Button>
    ) : null;

  const productDetailsButton = (
    <Button
      data-gtm="explore-data-products.product-details-button"
      data-gtm-product-code={productCode}
      data-selenium={`browse-data-products-page.products.${productCode}.product-details-button`}
      className={classes.productCardButton}
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
    <Paper className={classes.productCard}>

      <Grid container spacing={2} style={{ marginBottom: Theme.spacing(2) }}>
        <Grid item xs={12} sm={7} md={8} lg={9}>
          {name}
          {description}
        </Grid>
        <Grid item xs={12} sm={5} md={4} lg={3}>
          {downloadDataButton}
          {viewTimeSeriesDataButton}
          {aopViewerButton}
          {productDetailsButton}
        </Grid>
      </Grid>

      {bundleInfo}

      <Grid container spacing={2} style={{ marginBottom: Theme.spacing(2) }}>
        <Grid item xs={12} sm={4}>
          <Typography variant="subtitle2">
            Product ID
          </Typography>
          <Typography variant="body2">
            {productCode}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Typography variant="subtitle2">
            Available Dates
          </Typography>
          <Typography variant="body2">
            {timeRange}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Typography variant="subtitle2">
            Data Themes
          </Typography>
          <div style={{ display: 'flex' }}>
            {themeIcons}
          </div>
        </Grid>
      </Grid>

      {hasData ? (
        <DataProductAvailability siteCodes={siteCodes} />
      ) : null}
    </Paper>
  );
});

export default DataProduct;
