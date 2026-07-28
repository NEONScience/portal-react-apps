import React from 'react';

import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';

import DownloadDataContext from 'portal-core-components/lib/components/DownloadDataContext';
import NeonEnvironment from 'portal-core-components/lib/components/NeonEnvironment/NeonEnvironment';
import NeonContext from 'portal-core-components/lib/components/NeonContext';
import AopGeeDataViewer from 'portal-core-components/lib/components/AopGEEDataViewer';
import SaeDataViewer from 'portal-core-components/lib/components/SaeDataViewer/SaeDataViewer';
import TimeSeriesViewer from 'portal-core-components/lib/components/TimeSeriesViewer';
import { makeStyles } from 'portal-core-components/lib/components/Theme/makeStyles';
import { exists, existsNonEmpty } from 'portal-core-components/lib/util/typeUtil';
import { resolveProps } from 'portal-core-components/lib/util/defaultProps';

import DataProductContext from '../DataProductContext';
import Section from './Section';
import SkeletonSection from './SkeletonSection';

const useStyles = makeStyles()((theme) => ({
  divider: {
    margin: theme.spacing(3, 0, 4, 0),
  },
}));

const aopVideoUrl = (
  <>
    {' '}
    <a href={NeonEnvironment.getAopGEEVideoUrl()}>
      this video
    </a>
    {' '}
  </>
);

const TimeSeriesVizNode = (productCode, currentRelease) => {
  const { classes } = useStyles();
  return (
    <div key="TimeSeriesVizNode">
      <Typography variant="h5" gutterBottom>
        Time Series Viewer
      </Typography>
      <Divider className={classes.divider} />
      <TimeSeriesViewer
        key="timeSeriesViewer"
        productCode={productCode}
        release={currentRelease}
      />
    </div>
  );
};

const AopVizNode = () => {
  const { classes } = useStyles();
  return (
    <div key="AopVizNode">
      <Typography variant="body2" gutterBottom>
        This Google Earth Engine (GEE) viewer allows for interactive exploration of remotely
        sensed data from the Airborne Observation Platform (AOP) that have been added to GEE.
        In the app, change the field site and data product for up to two images and/or dates
        to view and compare. See
        {aopVideoUrl}
        for an overview of all the interactive features included in the app. Note that not all
        AOP data available on the data portal may be included in the GEE catalog at any given time.
      </Typography>
      <Divider className={classes.divider} />
      <AopGeeDataViewer isFullWidth={false} />
    </div>
  );
};

const SaeVizNode = (productCode, isMultiViz = false) => {
  const { classes, theme } = useStyles();
  const vizNodeStyle = {};
  if (isMultiViz) {
    vizNodeStyle.marginTop = theme.spacing(6);
  }
  return (
    <div key="SaeVizNode" style={vizNodeStyle}>
      <Typography variant="h5" gutterBottom>
        SAE Data Viewer
      </Typography>
      <Typography variant="body2" gutterBottom>
        This tool provides a quick, interactive view of fluxes and key meteorological drivers.
        Users can preview time series, QC information, and site-level patterns before downloading
        data.
      </Typography>
      <Divider className={classes.divider} />
      <SaeDataViewer key="saeDataViewer" productCode={productCode} />
    </div>
  );
};

const defaultProps = {
  skeleton: false,
  children: null,
};

const VisualizationsSection = (inProps) => {
  const props = resolveProps(defaultProps, inProps);
  const { theme } = useStyles();
  const [{ data: neonContextData }] = NeonContext.useNeonContextState();
  const {
    timeSeriesDataProducts: timeSeriesDataProductsJSON = { productCodes: [] },
  } = neonContextData;
  const { productCodes: timeSeriesProductCodes } = timeSeriesDataProductsJSON;
  const {
    aopDataProducts: aopDataProductsJSON = { productCodes: [] },
  } = neonContextData;
  const { productCodes: aopProductCodes } = aopDataProductsJSON;
  const {
    saeDataProducts: saeDataProductsJSON = { productCodes: [] },
  } = neonContextData;
  const { productCodes: saeProductCodes } = saeDataProductsJSON;

  const [state, dispatch] = DataProductContext.useDataProductContextState();
  const product = DataProductContext.getCurrentProductFromState(state);
  const [{ productData: appliedProductData }] = DownloadDataContext.useDownloadDataState();
  const {
    route: {
      productCode,
      release: currentRelease,
      bundle: {
        parentCodes,
        forwardAvailabilityFromParent,
      },
    },
  } = state;

  const currentReleaseObject = DataProductContext.getCurrentReleaseObjectFromState(state);

  if (!product) {
    return <SkeletonSection {...props} />;
  }

  let defaultVizMessage = 'This product does not currently have any visualizations.';
  const hasViz = timeSeriesProductCodes.includes(productCode)
    || aopProductCodes.includes(productCode)
    || saeProductCodes.includes(productCode);

  // Build an object containing rendered visualization nodes
  const viz = {};
  if (hasViz) {
    const isBundleChild = existsNonEmpty(parentCodes);
    const shouldForwardAvailability = (forwardAvailabilityFromParent === true);
    const hasData = (exists(product) && existsNonEmpty(product.siteCodes))
      || (
        isBundleChild
        && shouldForwardAvailability
        && (exists(appliedProductData) && existsNonEmpty(appliedProductData.siteCodes))
      );
    if (!hasData) {
      defaultVizMessage = 'This product does not currently have any data to display.';
    } else {
      if (timeSeriesProductCodes.includes(productCode)) {
        viz.TIME_SERIES = {
          name: 'Time Series Viewer',
          node: TimeSeriesVizNode(productCode, currentRelease),
        };
      }
      if (aopProductCodes.includes(productCode)) {
        viz.AOP = {
          name: 'AOP GEE Data Viewer',
          node: AopVizNode(),
        };
      }
      if (saeProductCodes.includes(productCode)) {
        viz.SAE = {
          name: 'SAE Data Viewer',
          node: SaeVizNode(productCode, timeSeriesProductCodes.includes(productCode)),
        };
      }
    }
  }

  const hideViz = currentReleaseObject && (currentReleaseObject.showViz === false);
  if (currentRelease && hideViz && Object.keys(viz).length) {
    const releaseTag = <b>{currentRelease}</b>;
    const handleOnClick = () => {
      dispatch({ type: 'setNextRelease', release: null, hash: 'visualizations' });
    };
    return (
      <Section {...props}>
        {/* eslint-disable react/jsx-one-expression-per-line */}
        <Typography variant="subtitle1" style={{ color: theme.colors.GREY[500] }} gutterBottom>
          This page is specific to the {releaseTag} release for this data product.
          <br />
          Data visualizations for this product can be accessed on the general page for this product.
        </Typography>
        {/* eslint-enable react/jsx-one-expression-per-line */}
        <Button variant="outlined" onClick={handleOnClick}>
          Go to visualizations for this product
        </Button>
      </Section>
    );
  }

  return (
    <Section {...props}>
      {Object.keys(viz).length ? (
        Object.keys(viz).map((k) => viz[k].node)
      ) : (
        <Typography variant="subtitle1" style={{ color: theme.colors.GREY[500] }}>
          {defaultVizMessage}
        </Typography>
      )}
    </Section>
  );
};

VisualizationsSection.propTypes = Section.propTypes;

export default VisualizationsSection;
