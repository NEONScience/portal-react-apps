/* eslint-disable react/jsx-one-expression-per-line, jsx-a11y/anchor-is-valid */
import React from 'react';
import PropTypes from 'prop-types';

import { ReplaySubject } from 'rxjs';

import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Chip from '@material-ui/core/Chip';
import Grid from '@material-ui/core/Grid';
import Link from '@material-ui/core/Link';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';

import MoreIcon from '@material-ui/icons/KeyboardArrowRight';
import TimeSeriesIcon from '@material-ui/icons/ShowChartOutlined';
import ProductDetailsIcon from '@material-ui/icons/InfoOutlined';
import AopDataViewerIcon from '@material-ui/icons/SatelliteOutlined';

import DataProductAvailability from 'portal-core-components/lib/components/DataProductAvailability';
import DataProductBundleCard from 'portal-core-components/lib/components/Bundles/DataProductBundleCard';
import DataThemeIcon from 'portal-core-components/lib/components/DataThemeIcon';
import DownloadDataButton from 'portal-core-components/lib/components/DownloadDataButton';
import DownloadDataContext from 'portal-core-components/lib/components/DownloadDataContext';
import ReleaseChip from 'portal-core-components/lib/components/Chip/ReleaseChip';
import Theme from 'portal-core-components/lib/components/Theme';

import BundleContentBuilder from 'portal-core-components/lib/components/Bundles/BundleContentBuilder';
import RouteService from 'portal-core-components/lib/service/RouteService';
import { isStringNonEmpty } from 'portal-core-components/lib/util/typeUtil';
import ReleaseService, { LATEST_AND_PROVISIONAL } from 'portal-core-components/lib/service/ReleaseService';

import ExploreContext from '../ExploreContext';

import {
  FILTER_KEYS,
  VISUALIZATIONS,
  getCurrentProductsByRelease,
} from '../util/filterUtil';

const useStyles = makeStyles((theme) => ({
  productCard: {
    marginBottom: theme.spacing(3),
  },
  productName: {
    fontWeight: 600,
  },
  productCodeChip: {
    color: theme.palette.grey[400],
    border: `1px solid ${theme.palette.grey[400]}`,
    backgroundColor: theme.palette.grey[100],
    fontWeight: 600,
    cursor: 'help',
  },
  releaseChipIcon: {
    color: theme.colors.GREEN[800],
    fontSize: '1em',
    marginRight: theme.spacing(0.75),
  },
  releaseChip: {
    color: theme.colors.LIGHT_BLUE[800],
    border: `1px solid ${theme.colors.LIGHT_BLUE[300]}`,
    backgroundColor: theme.colors.LIGHT_BLUE[50],
    fontWeight: 600,
    cursor: 'help',
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

  // Used as a key prop on any rendered elements we want to re-render with a release change
  const renderKey = `${productCode}/${currentRelease || ''}`;

  const isAopViewerProduct = aopVizProducts.includes(productCode);
  const descriptionExpanded = productDescriptionExpanded[productCode];

  const {
    bundle,
    themes,
    productName,
    productDescription: rawProductDescription,
  } = productData;

  const productDescription = rawProductDescription || '--';

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
    ? RouteService.getProductDetailPath(productCode)
    : RouteService.getProductDetailPath(productCode, currentRelease);

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
  const isRelease = isStringNonEmpty(currentRelease) && (currentRelease !== LATEST_AND_PROVISIONAL);
  const delineateAvaRelease = ReleaseService.determineDelineateAvaRelease(currentRelease);

  const code = (
    <div className={classes.startFlex} style={{ margin: Theme.spacing(1.5, 0) }}>
      <Tooltip
        title="The unique identifier for this data product independent of release"
      >
        <Chip
          size="small"
          label={productCode}
          className={classes.productCodeChip}
        />
      </Tooltip>
      {currentRelease === LATEST_AND_PROVISIONAL ? null : (
        <ReleaseChip
          chipLabel={`Release: ${currentRelease}`}
          chipStyle={{
            marginLeft: Theme.spacing(1.5),
          }}
          classes={{
            chip: classes.releaseChip,
            icon: classes.releaseChipIcon,
          }}
          tooltipTitle={(
            <span>
              Availability and metadata shown is for
              the <b>{currentRelease}</b> release of this product
            </span>
          )}
        />
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
        <>
          {`${truncatedDescription}… `}
          <Link
            component="button"
            className={classes.moreLink}
            onClick={() => dispatch({ type: 'expandProductDescription', productCode })}
          >
            More
            <MoreIcon fontSize="small" className={classes.moreIcon} />
          </Link>
        </>
      ) : productDescription}
    </Typography>
  );

  const renderBundleInfo = () => {
    if (!isBundleChild || !bundleParentProductData) {
      return null;
    }
    const bundleShowManyParents = Array.isArray(bundleParentProductData);
    let titleContent;
    let detailContent;
    const subTitleContent = BundleContentBuilder.buildDefaultSubTitleContent(
      bundle.forwardAvailability,
      bundleShowManyParents,
    );
    if (!bundleShowManyParents) {
      const dataProductLike = {
        productCode: bundleParentProductData.productCode,
        productName: bundleParentProductData.productName,
      };
      titleContent = BundleContentBuilder.buildDefaultTitleContent(dataProductLike, currentRelease);
    } else {
      titleContent = BundleContentBuilder.buildDefaultSplitTitleContent(isRelease, ':');
      const dataProductLikes = bundleParentProductData.map((bundleParentProduct) => ({
        productCode: bundleParentProduct.productCode,
        productName: bundleParentProduct.productName,
      }));
      detailContent = BundleContentBuilder.buildManyParentsMainContent(
        dataProductLikes,
        currentRelease,
      );
    }
    return (
      <div style={{ marginBottom: Theme.spacing(2) }}>
        <DataProductBundleCard
          isSplit={bundleShowManyParents}
          titleContent={titleContent}
          detailContent={detailContent}
          subTitleContent={subTitleContent}
        />
      </div>
    );
  };

  const downloadDataButton = hasData ? (
    <DownloadDataContext.Provider
      key={renderKey}
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

  const handleChangeVisualization = (component) => dispatch({
    type: 'changeActiveDataVisualization',
    component,
    productCode,
  });

  const aopViewerButton = hasData && isAopViewerProduct
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

  const viewTimeSeriesDataButton = hasTimeSeriesData
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

  const themeIcons = (themes || []).sort().map((dataTheme) => (
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

        {renderBundleInfo()}

        <Grid container spacing={2} style={{ marginBottom: Theme.spacing(1) }}>
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
          {!hasData || !hasVisualization ? null : (
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
          <DataProductAvailability
            delineateRelease={delineateAvaRelease}
            siteCodes={siteCodes}
          />
        ) : null}

      </CardContent>
    </Card>
  );
});

DataProduct.propTypes = {
  productCode: PropTypes.string.isRequired,
  highestOrderDownloadSubject: PropTypes.instanceOf(ReplaySubject).isRequired,
};

export default DataProduct;
