import React, { Suspense } from 'react';

import DialogBase from 'portal-core-components/lib/components/DialogBase';

import ExploreContext from '../ExploreContext';

import {
  VISUALIZATIONS,
  LATEST_AND_PROVISIONAL,
  getCurrentProductsByRelease,
} from '../util/filterUtil';

const AopDataViewer = React.lazy(() => import('portal-core-components/lib/components/AopDataViewer'));
const TimeSeriesViewer = React.lazy(() => import('portal-core-components/lib/components/TimeSeriesViewer'));
// import AopDataViewer from 'portal-core-components/lib/components/AopDataViewer';
// import TimeSeriesViewer from 'portal-core-components/lib/components/TimeSeriesViewer';

const DataVisualizationDialog = () => {
  const [state, dispatch] = ExploreContext.useExploreContextState();
  const {
    currentProducts: { release: currentRelease },
    activeDataVisualization: { component, productCode },
  } = state;

  if (currentRelease !== LATEST_AND_PROVISIONAL) { return null; }

  const products = getCurrentProductsByRelease(state);
  const product = products[productCode];

  let title = 'Data Visualization';
  let contents = <></>;
  const dialogBaseProps = {};
  const open = (
    typeof product !== 'undefined'
      && typeof component !== 'undefined'
      && Object.keys(VISUALIZATIONS).includes(component)
  );

  if (open) {
    switch (component) {
      case VISUALIZATIONS.AOP_DATA_VIEWER.key:
        title = `AOP Data Viewer - ${productCode} - ${product.productName}`;
        contents = (
          <AopDataViewer productCode={productCode} showTitle={false} />
        );
        break;

      case VISUALIZATIONS.TIME_SERIES_VIEWER.key:
        title = `Time Series Viewer - ${productCode} - ${product.productName}`;
        dialogBaseProps.nopaper = true;
        contents = (
          <TimeSeriesViewer productCode={productCode} />
        );
        break;

      default:
        break;
    }
  }

  return (
    <Suspense fallback={<></>}>
      <DialogBase
        open={open}
        title={title}
        onClose={() => dispatch({ type: 'changeActiveDataVisualization' })}
        data-selenium="data-visualization-dialog"
        {...dialogBaseProps}
      >
        {contents}
      </DialogBase>
    </Suspense>
  );
};

export default DataVisualizationDialog;
