/* eslint-disable import/no-unresolved */
// TODO: figure out why NeonContext raises an import/no-unresolved false positive
// (why that rule is disabled in this file)
import React, {
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';

import { of } from 'rxjs';
import { ajax } from 'rxjs/ajax';
import { map, catchError } from 'rxjs/operators';

import NeonContext from 'portal-core-components/lib/components/NeonContext';
import NeonEnvironment from 'portal-core-components/lib/components/NeonEnvironment';
import AopDataViewer from 'portal-core-components/lib/components/AopDataViewer';
import TimeSeriesViewer from 'portal-core-components/lib/components/TimeSeriesViewer';

import { StoreContext } from '../../Store';
import Section from './Section';

const viz = {};

const VisualizationsSection = (props) => {
  const { state } = useContext(StoreContext);
  const { setVisible } = props;

  const [{ data: neonContextData }] = NeonContext.useNeonContextState();
  const {
    timeSeriesDataProducts: timeSeriesDataProductsJSON = { productCodes: [] },
  } = neonContextData;
  const { productCodes: timeSeriesProductCodes } = timeSeriesDataProductsJSON;

  const [hasViz, setHasViz] = useState(false);

  /**
     Effect: Toggle visibility on if this is a Time Series Viewer product
  */
  useEffect(() => {
    if (
      state.product && state.product.productCode
        && timeSeriesProductCodes.includes(state.product.productCode)
    ) {
      viz.TIME_SERIES = {
        name: 'Time Series Viewer',
        node: <TimeSeriesViewer key="timeSeriesViewer" productCode={state.product.productCode} />,
      };
      setHasViz(true);
      setVisible(true);
    }
  }, [state, timeSeriesProductCodes, setHasViz, setVisible]);

  /**
     Effect: conditionally fetch streamable AOP products to add AOP Data Viewer
  */
  const isAOP = (state.product && (state.product.productScienceTeam || '').includes('AOP'));
  const [fetchAopCalled, setFetchAopCalled] = useState(false);
  const handleFetchAop = useCallback(() => ajax
    .getJSON(NeonEnvironment.getVisusProductsBaseUrl())
    .pipe(
      map((response) => {
        if (Array.isArray(response.data) && response.data.includes(state.product.productCode)) {
          viz.AOP = {
            name: 'AOP Data Viewer',
            node: <AopDataViewer key="aopDataViewer" productCode={state.product.productCode} />,
          };
          setHasViz(true);
          setVisible(true);
        }
      }),
      catchError(() => of('Unable to query for streamable products')),
    ).subscribe(), [state, setVisible]);
  useEffect(() => {
    if (isAOP && NeonEnvironment.showAopViewer && !fetchAopCalled) {
      handleFetchAop();
      setFetchAopCalled(true);
    }
  }, [state, isAOP, fetchAopCalled, handleFetchAop]);

  if (!hasViz) { return null; }

  return (
    <Section {...props}>
      {Object.keys(viz).map(k => viz[k].node)}
    </Section>
  );
};

VisualizationsSection.propTypes = Section.propTypes;

VisualizationsSection.defaultProps = Section.defaultProps;

export default VisualizationsSection;
