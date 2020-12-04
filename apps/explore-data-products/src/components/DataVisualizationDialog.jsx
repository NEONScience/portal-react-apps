import React, { Suspense } from 'react';

import { DataVisualizationComponents } from '../../actions/actions';

import DialogBase from 'portal-core-components/lib/components/DialogBase';

const AopDataViewer = React.lazy(() => import('portal-core-components/lib/components/AopDataViewer'));
const TimeSeriesViewer = React.lazy(() => import('portal-core-components/lib/components/TimeSeriesViewer'));
// import AopDataViewer from 'portal-core-components/lib/components/AopDataViewer';
// import TimeSeriesViewer from 'portal-core-components/lib/components/TimeSeriesViewer';

const DataVisualizationDialog = (props) => {
  const {
    products,
    component,
    productCode,
    onChangeActiveDataVisualization,
  } = props;

  let title = 'Data Visualization';
  let contents = <React.Fragment />;
  const open = Object.keys(DataVisualizationComponents).includes(component)
    && Object.keys(products).includes(productCode);
  const dialogBaseProps = {};

  if (open) {
    const product = products[productCode];
    switch (component) {
      case DataVisualizationComponents.AOP:
        title = `AOP Data Viewer - ${productCode} - ${product.productName}`;
        contents = (
          <AopDataViewer productCode={productCode} showTitle={false} />
        );
        break;

      case DataVisualizationComponents.TIME_SERIES:
        title = `Time Series Viewer - ${productCode} - ${product.productName}`;
        dialogBaseProps.nopaper = true;
        contents = (
          <TimeSeriesViewer productCode={productCode} />
        );
        break;

      default:
        break;
    };
  }

  return (
    <Suspense fallback={<React.Fragment />}>
      <DialogBase
        open={open}
        title={title}
        onClose={() => onChangeActiveDataVisualization()}
        data-selenium="data-visualization-dialog"
        {...dialogBaseProps}
      >
        {contents}
      </DialogBase>
    </Suspense>
  );
};

export default DataVisualizationDialog;
