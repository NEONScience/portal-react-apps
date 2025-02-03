/* eslint-disable import/no-unresolved */
// TODO: figure out why NeonContext raises an import/no-unresolved false positive
// (why that rule is disabled in this file)
import React from 'react';

import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

import NeonContext from 'portal-core-components/lib/components/NeonContext';
import AopDataViewer from 'portal-core-components/lib/components/AopDataViewer';
import TimeSeriesViewer from 'portal-core-components/lib/components/TimeSeriesViewer';
import Theme from 'portal-core-components/lib/components/Theme';
import { exists, existsNonEmpty } from 'portal-core-components/lib/util/typeUtil';

import DataProductContext from '../DataProductContext';
import Section from './Section';
import SkeletonSection from './SkeletonSection';

const VisualizationsSection = (props) => {
  const [{ data: neonContextData }] = NeonContext.useNeonContextState();
  const {
    timeSeriesDataProducts: timeSeriesDataProductsJSON = { productCodes: [] },
  } = neonContextData;
  const { productCodes: timeSeriesProductCodes } = timeSeriesDataProductsJSON;

  const [state, dispatch] = DataProductContext.useDataProductContextState();
  const product = DataProductContext.getCurrentProductFromState(state);

  const {
    route: { productCode, release: currentRelease },
    data: { aopVizProducts },
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
  if (aopVizProducts.includes(productCode)) {
    viz.AOP = {
      name: 'AOP Data Viewer',
      node: <AopDataViewer key="aopDataViewer" showOpenInNewWindow productCode={productCode} />,
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
