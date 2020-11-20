/* eslint-disable import/no-unresolved */
// TODO: figure out why NeonContext raises an import/no-unresolved false positive
// (why that rule is disabled in this file)
import React, { useState, useEffect, useCallback } from 'react';

import { of } from 'rxjs';
import { ajax } from 'rxjs/ajax';
import { map, catchError } from 'rxjs/operators';

import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';

import NeonContext from 'portal-core-components/lib/components/NeonContext';
import NeonEnvironment from 'portal-core-components/lib/components/NeonEnvironment';
import AopDataViewer from 'portal-core-components/lib/components/AopDataViewer';
import TimeSeriesViewer from 'portal-core-components/lib/components/TimeSeriesViewer';
import Theme from 'portal-core-components/lib/components/Theme';

import DataProductContext from '../DataProductContext';
import Section from './Section';

const viz = {};

const VisualizationsSection = (props) => {
  const [{ data: neonContextData }] = NeonContext.useNeonContextState();
  const {
    timeSeriesDataProducts: timeSeriesDataProductsJSON = { productCodes: [] },
  } = neonContextData;
  const { productCodes: timeSeriesProductCodes } = timeSeriesDataProductsJSON;

  const [state] = DataProductContext.useDataProductContextState();
  const product = DataProductContext.getCurrentProductFromState(state);

  const {
    route: { productCode, release: currentRelease },
  } = state;

  const [hasViz, setHasViz] = useState(false);

  /**
     Effect: Toggle visibility on if this is a Time Series Viewer product
  */
  useEffect(() => {
    if (productCode && timeSeriesProductCodes.includes(productCode)) {
      viz.TIME_SERIES = {
        name: 'Time Series Viewer',
        node: <TimeSeriesViewer key="timeSeriesViewer" productCode={productCode} />,
      };
      setHasViz(true);
    }
  }, [productCode, timeSeriesProductCodes, setHasViz]);

  /**
     Effect: conditionally fetch streamable AOP products to add AOP Data Viewer
  */
  const isAOP = (product && (product.productScienceTeam || '').includes('AOP'));
  const [fetchAopCalled, setFetchAopCalled] = useState(false);
  const handleFetchAop = useCallback(() => ajax
    .getJSON(NeonEnvironment.getVisusProductsBaseUrl())
    .pipe(
      map((response) => {
        if (Array.isArray(response.data) && response.data.includes(product.productCode)) {
          viz.AOP = {
            name: 'AOP Data Viewer',
            node: <AopDataViewer key="aopDataViewer" productCode={product.productCode} />,
          };
          setHasViz(true);
        }
      }),
      catchError(() => of('Unable to query for streamable products')),
    ).subscribe(), [product.productCode]);
  useEffect(() => {
    if (!currentRelease && isAOP && NeonEnvironment.showAopViewer && !fetchAopCalled) {
      handleFetchAop();
      setFetchAopCalled(true);
    }
  }, [state, isAOP, fetchAopCalled, handleFetchAop, currentRelease]);

  if (currentRelease && hasViz) {
    const releaseTag = <b>{currentRelease}</b>;
    const generalPageLink = (
      <Link href={`/data-products/${productCode}#visualizations`}>
        general page for this product
      </Link>
    );
    /* eslint-disable react/jsx-one-expression-per-line */
    return (
      <Section {...props}>
        <Typography variant="subtitle1" style={{ color: Theme.colors.GREY[500] }}>
          This page is specific to the {releaseTag} release for this data product.
          <br />
          Data visualizations for this product can be accessed on the {generalPageLink}
        </Typography>
      </Section>
    );
    /* eslint-enable react/jsx-one-expression-per-line */
  }

  return (
    <Section {...props}>
      {hasViz ? (
        Object.keys(viz).map(k => viz[k].node)
      ) : (
        <Typography variant="subtitle1" style={{ color: Theme.colors.GREY[500] }}>
          This product does not currently have any visualizations.
        </Typography>
      )}
    </Section>
  );
};

VisualizationsSection.propTypes = Section.propTypes;

VisualizationsSection.defaultProps = Section.defaultProps;

export default VisualizationsSection;
