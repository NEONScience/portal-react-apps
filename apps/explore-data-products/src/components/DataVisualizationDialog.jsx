import React, { Suspense } from 'react';

import { makeStyles } from '@material-ui/core/styles';

import DialogBase from 'portal-core-components/lib/components/DialogBase';
import Theme from 'portal-core-components/lib/components/Theme';

import ExploreContext from '../ExploreContext';

import {
  VISUALIZATIONS,
  LATEST_AND_PROVISIONAL,
  getCurrentProductsByRelease,
} from '../util/filterUtil';

const AopDataViewer = React.lazy(() => import('portal-core-components/lib/components/AopDataViewer'));
const TimeSeriesViewer = React.lazy(() => import('portal-core-components/lib/components/TimeSeriesViewer'));

const useDialogBaseStyles = makeStyles((theme) => ({
  contentPaper: {
    margin: theme.spacing(10, 2, 2, 2),
    padding: theme.spacing(3),
    height: '100%',
    position: 'relative',
    width: `calc(100% - ${theme.spacing(2) * 2}px)`,
    minWidth: '340px',
    minHeight: '600px',
    [Theme.breakpoints.down('xs')]: {
      minHeight: '700px',
    },
  },
}));

const DataVisualizationDialog = () => {
  const dialogBaseClasses = useDialogBaseStyles(Theme);
  const [state, dispatch] = ExploreContext.useExploreContextState();
  const {
    currentProducts: { release: currentRelease },
    activeDataVisualization: { component, productCode },
  } = state;

  const appliedRelease = currentRelease && (currentRelease !== LATEST_AND_PROVISIONAL)
    ? currentRelease
    : null;

  const products = getCurrentProductsByRelease(state);
  const product = products[productCode];

  let title = 'Data Visualization';
  // eslint-disable-next-line react/jsx-no-useless-fragment
  let contents = <></>;
  let appliedDialogBaseClasses;
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
          <AopDataViewer fillContainer productCode={productCode} showTitle={false} />
        );
        appliedDialogBaseClasses = dialogBaseClasses;
        break;

      case VISUALIZATIONS.TIME_SERIES_VIEWER.key:
        title = `Time Series Viewer - ${productCode} - ${product.productName}`;
        dialogBaseProps.nopaper = true;
        contents = (
          <TimeSeriesViewer productCode={productCode} release={appliedRelease} />
        );
        break;

      default:
        break;
    }
  }

  return (
    <Suspense fallback={null}>
      <DialogBase
        open={open}
        title={title}
        customClasses={appliedDialogBaseClasses}
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
