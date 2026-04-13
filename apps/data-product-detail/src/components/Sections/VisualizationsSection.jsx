/* eslint-disable import/no-unresolved */
// TODO: figure out why NeonContext raises an import/no-unresolved false positive
// (why that rule is disabled in this file)
import React from 'react';

import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import { makeStyles } from '@material-ui/core/styles';

import NeonEnvironment from 'portal-core-components/lib/components/NeonEnvironment/NeonEnvironment';
import NeonContext from 'portal-core-components/lib/components/NeonContext';
import AopGeeDataViewer from 'portal-core-components/lib/components/AopGEEDataViewer';
import TimeSeriesViewer from 'portal-core-components/lib/components/TimeSeriesViewer';
import Theme from 'portal-core-components/lib/components/Theme';
import { exists, existsNonEmpty } from 'portal-core-components/lib/util/typeUtil';

import DataProductContext from '../DataProductContext';
import Section from './Section';
import SkeletonSection from './SkeletonSection';

const useStyles = makeStyles((theme) => ({
  divider: {
    margin: theme.spacing(2, 0),
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

const AopVizNode = () => {
  const classes = useStyles(Theme);
  return (
    <div>
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
      {/* <Divider /> */}
      <AopGeeDataViewer isFullWidth={false} />
    </div>
  );
};

const VisualizationsSection = (props) => {
  const [{ data: neonContextData }] = NeonContext.useNeonContextState();
  const {
    timeSeriesDataProducts: timeSeriesDataProductsJSON = { productCodes: [] },
  } = neonContextData;
  const { productCodes: timeSeriesProductCodes } = timeSeriesDataProductsJSON;
  const {
    aopDataProducts: aopDataProductsJSON = { productCodes: [] },
  } = neonContextData;
  const { productCodes: aopProductCodes } = aopDataProductsJSON;

  const [state, dispatch] = DataProductContext.useDataProductContextState();
  const product = DataProductContext.getCurrentProductFromState(state);

  const {
    route: { productCode, release: currentRelease },
  } = state;

  const currentReleaseObject = DataProductContext.getCurrentReleaseObjectFromState(state);

  if (!product) {
    return <SkeletonSection {...props} />;
  }

  let defaultVizMessage = 'This product does not currently have any visualizations.';

  // Build an object containing rendered visualization nodes
  const viz = {};
  if (timeSeriesProductCodes.includes(productCode)) {
    const hasData = exists(product) && existsNonEmpty(product.siteCodes);
    if (!hasData) {
      defaultVizMessage = 'This product does not currently have any data to display.';
    } else {
      viz.TIME_SERIES = {
        name: 'Time Series Viewer',
        node: (
          <TimeSeriesViewer
            key="timeSeriesViewer"
            productCode={productCode}
            release={currentRelease}
          />
        ),
      };
    }
  }
  if (aopProductCodes.includes(productCode)) {
    viz.AOP = {
      name: 'AOP GEE Data Viewer',
      node: AopVizNode(),
    };
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
        <Typography variant="subtitle1" style={{ color: Theme.colors.GREY[500] }} gutterBottom>
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
        <Typography variant="subtitle1" style={{ color: Theme.colors.GREY[500] }}>
          {defaultVizMessage}
        </Typography>
      )}
    </Section>
  );
};

VisualizationsSection.propTypes = Section.propTypes;
VisualizationsSection.defaultProps = Section.defaultProps;

export default VisualizationsSection;
