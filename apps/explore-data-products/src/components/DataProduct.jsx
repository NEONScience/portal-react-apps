/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { ReplaySubject } from 'rxjs';

import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import MoreIcon from '@mui/icons-material/KeyboardArrowRight';
import TimeSeriesIcon from '@mui/icons-material/ShowChartOutlined';
import SaeViewerIcon from '@mui/icons-material/TimelineOutlined';
import ProductDetailsIcon from '@mui/icons-material/InfoOutlined';

import AopGeeDataViewer from '@neonscience/portal-core-components/components/AopGEEDataViewer';
import SplitButton from '@neonscience/portal-core-components/components/Button/SplitButton';
import DataProductAvailability from '@neonscience/portal-core-components/components/DataProductAvailability';
import DataProductBundleCard from '@neonscience/portal-core-components/components/Bundles/DataProductBundleCard';
import DataThemeIcon from '@neonscience/portal-core-components/components/DataThemeIcon';
import DownloadDataButton from '@neonscience/portal-core-components/components/DownloadDataButton';
import DownloadDataContext from '@neonscience/portal-core-components/components/DownloadDataContext';
import ReleaseChip from '@neonscience/portal-core-components/components/Chip/ReleaseChip';
import BundleContentBuilder from '@neonscience/portal-core-components/components/Bundles/BundleContentBuilder';
import RouteService from '@neonscience/portal-core-components/service/RouteService';
import ReleaseService, { LATEST_AND_PROVISIONAL } from '@neonscience/portal-core-components/service/ReleaseService';
import { makeStyles } from '@neonscience/portal-core-components/components/Theme/makeStyles';
import { isStringNonEmpty } from '@neonscience/portal-core-components/util/typeUtil';

import ExploreContext from '../ExploreContext';

import {
  FILTER_KEYS,
  VISUALIZATIONS,
  getCurrentProductsByRelease,
} from '../util/filterUtil';

const useStyles = makeStyles()((theme) => ({
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
    paddingTop: '1px',
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
    paddingTop: '1px',
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
    fontSize: '1rem',
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
  const { classes, theme } = useStyles();

  const { productCode, highestOrderDownloadSubject } = props;

  const [state, dispatch] = ExploreContext.useExploreContextState();
  const {
    productDescriptionExpanded,
    neonContextState,
    currentProducts: { release: currentRelease },
  } = state;
  const products = getCurrentProductsByRelease(state);
  const [selectedVis, setSelectedVis] = useState(VISUALIZATIONS.TIME_SERIES_VIEWER);

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
    aopDataProducts: aopDataProductsJSON = { productCodes: [] },
    saeDataProducts: saeDataProductsJSON = { productCodes: [] },
  } = neonContextState.data;
  const { productCodes: timeSeriesProductCodes } = timeSeriesDataProductsJSON;
  const { productCodes: aopProductCodes } = aopDataProductsJSON;
  const isAopViewerProduct = aopProductCodes.includes(productCode);
  const { productCodes: saeProductCodes } = saeDataProductsJSON;
  const isSaeViewerProduct = saeProductCodes.includes(productCode);
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
    <div className={classes.startFlex} style={{ margin: theme.spacing(1.5, 0) }}>
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
            marginLeft: theme.spacing(1.5),
          }}
          classes={{
            chip: classes.releaseChip,
            icon: classes.releaseChipIcon,
          }}
          tooltipTitle={(
            <span>
              Availability and metadata shown is for
              {' '}
              <b>{currentRelease}</b>
              {' '}
              release of this product
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
    <Typography variant="body2" style={{ marginTop: theme.spacing(1) }}>
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
        theme,
        dataProductLikes,
        currentRelease,
      );
    }
    return (
      <div style={{ marginBottom: theme.spacing(2) }}>
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

  function getVisList() {
    const visList = [];
    // Determine release for viz when not a "non" release and not a special case release.
    const hideVizForRelease = isStringNonEmpty(currentRelease)
      && !ReleaseService.isNonRelease(currentRelease)
      && !ReleaseService.isLatestNonProv(currentRelease);
    if (hasTimeSeriesData) {
      visList.push(VISUALIZATIONS.TIME_SERIES_VIEWER);
    }
    if (isSaeViewerProduct && !hideVizForRelease) {
      visList.push(VISUALIZATIONS.SAE_DATA_VIEWER);
    }
    if (isAopViewerProduct && !hideVizForRelease) {
      visList.push(VISUALIZATIONS.AOP_DATA_VIEWER);
    }
    return visList;
  }
  const visList = getVisList();
  const hasVisualization = (visList.length > 0);

  const aopViewerButton = hasData && visList.includes(VISUALIZATIONS.AOP_DATA_VIEWER)
    ? (
      <AopGeeDataViewer
        name="aop-visuialization-button"
        isFullWidth
      />
    ) : null;

  const saeViewerButton = hasData && visList.includes(VISUALIZATIONS.SAE_DATA_VIEWER)
    ? (
      <Button
        data-gtm="explore-data-products.view-sae-data-viewer-button"
        data-gtm-product-code={productCode}
        data-selenium={
          `browse-data-products-page.products.${productCode}.view-sae-data-viewer-button`
        }
        className={classes.productPaperButton}
        variant="outlined"
        color="primary"
        endIcon={<SaeViewerIcon />}
        onClick={() => handleChangeVisualization(VISUALIZATIONS.SAE_DATA_VIEWER.key)}
      >
        {VISUALIZATIONS.SAE_DATA_VIEWER.name}
      </Button>
    ) : null;

  const includeTimeSeriesViewer = hasTimeSeriesData
    && visList.includes(VISUALIZATIONS.TIME_SERIES_VIEWER);
  const viewTimeSeriesDataButton = includeTimeSeriesViewer
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

  function getVizByName(visName) {
    const viz = visList.find((val) => (val.name === visName));
    return viz ?? null;
  }

  function handleSplitButtonClick(option) {
    const viz = getVizByName(option);
    if (viz.key === VISUALIZATIONS.TIME_SERIES_VIEWER.key) {
      handleChangeVisualization(viz.key);
    } else if (viz.key === VISUALIZATIONS.SAE_DATA_VIEWER.key) {
      handleChangeVisualization(viz.key);
    }
  }

  function renderVisuialization() {
    if (visList.length > 1) {
      const selName = selectedVis ? selectedVis.name : '';
      const vizIcon = selectedVis ? (<selectedVis.icon />) : null;
      return (
        <SplitButton
          styleOverrides={{ padding: '6px 0px' }}
          isFullWidth
          name="visuialization-split-button"
          selectedOption={selName}
          onChange={(option) => (
            setSelectedVis(getVizByName(option))
          )}
          selectedOptionDisplayCallback={(selOption) => (
            selOption
          )}
          options={visList.map((val) => (val.name))}
          onClick={(option) => (handleSplitButtonClick(option))}
          buttonGroupProps={{
            variant: 'outlined',
            color: 'primary',
          }}
          buttonMenuProps={{
            color: 'primary',
          }}
          buttonProps={{
            color: 'primary',
            endIcon: vizIcon,
          }}
        />
      );
    }

    return (
      <>
        {viewTimeSeriesDataButton}
        {aopViewerButton}
        {saeViewerButton}
      </>
    );
  }

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
    <div key={dataTheme} style={{ marginRight: theme.spacing(0.5) }}>
      <DataThemeIcon theme={dataTheme} size={4} />
    </div>
  ));

  return (
    <Card className={classes.productCard}>
      <CardContent data-selenium={`browse-data-products-page.product-card.${productCode}`}>
        <Grid container spacing={2} style={{ marginBottom: theme.spacing(2) }}>
          <Grid
            size={{
              xs: 12,
              sm: 7,
              md: 8,
              lg: 9,
            }}
          >
            {name}
            {code}
            {description}
          </Grid>
          <Grid
            size={{
              xs: 12,
              sm: 5,
              md: 4,
              lg: 3,
            }}
          >
            {downloadDataButton}
            {productDetailsButton}
          </Grid>
        </Grid>

        {renderBundleInfo()}

        <Grid container spacing={2} style={{ marginBottom: theme.spacing(1) }}>
          {!timeRange ? null : (
            <Grid size={{ xs: 12, sm: 4 }}>
              <Typography variant="subtitle2" className={classes.detailSubtitle}>
                Available Dates
              </Typography>
              <Typography variant="body2">
                {timeRange}
              </Typography>
            </Grid>
          )}
          {!timeRange ? null : (
            <Grid size={{ xs: 12, sm: 4 }}>
              <Typography variant="subtitle2" className={classes.detailSubtitle}>
                Data Themes
              </Typography>
              <div style={{ display: 'flex' }}>
                {themeIcons}
              </div>
            </Grid>
          )}
          {!hasData || !hasVisualization ? null : (
            <Grid size={{ xs: 12, sm: 4 }}>
              <Typography variant="subtitle2" className={classes.detailSubtitle}>
                Visualize Data
              </Typography>
              {renderVisuialization()}
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
