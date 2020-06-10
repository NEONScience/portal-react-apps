import React, { useReducer, useEffect } from "react";

import cloneDeep from 'lodash/cloneDeep';

import Typography from "@material-ui/core/Typography";

import DownloadDataContext from 'portal-core-components/lib/components/DownloadDataContext';
import Theme from 'portal-core-components/lib/components/Theme';

import DataProduct from "../DataProduct/DataProduct";
import SkeletonDataProduct from "../SkeletonDataProduct/SkeletonDataProduct";

import { FetchStateType } from "../../actions/actions";

const PresentationData = (props) => {
  const {
    appFetchState,
    products,
    productOrder,
    productDescriptionExpanded,
    scrollCutoff,
    aopViewerProducts,
    onExpandProductDescription,
    onChangeActiveDataVisualization,
    highestOrderDownloadSubject,
  } = props;

  const skeleton = [FetchStateType.WORKING, FetchStateType.FAILED].includes(appFetchState);

  /**
   * Download Higher Order State Management
   */
  // Initialize state at the PresentationData component level for keeping the last
  const initialDownloadState = {
    downloadState: cloneDeep(DownloadDataContext.DEFAULT_STATE),
  };

  // Define a simple reducer for handling whole changes to the download state
  const downloadReducer = (state, action) => {
    switch (action.type) {
      case 'setDownloadState':
        return {
          downloadState: action.downloadState,
        };
      default:
        return {
          downloadState: DownloadDataContext.reducer(state.downloadState, action),
        };
    }
  };
  const [downloadState, downloadDispatch] = useReducer(downloadReducer, initialDownloadState);

  // Create an effect to broadcast the higher order download state out on the
  // main observable to be picked up by subscribed contexts whenever the broadcast
  // boolean is true (signifying a change worthy of going out across the board)
  useEffect(() => {
    if (downloadState.downloadState && downloadState.downloadState.broadcast) {
      highestOrderDownloadSubject.next(downloadState.downloadState);
      downloadDispatch({ type: 'setBroadcastDone' });
    }
  }, [downloadState.downloadState, highestOrderDownloadSubject]);

  // Create an effect to listen to updates broadcast from within a single download
  // context to update the higher-order state and trigger the above broadcast
  useEffect(() => {
    DownloadDataContext.getStateObservable().subscribe((newDownloadState) => {
      downloadDispatch({
        type: 'setDownloadState',
        downloadState: newDownloadState,
      });
    });
  }, []);

  /**
   * Render
   */
  return skeleton ? (
    <div id="data-presentation">
      <SkeletonDataProduct />
      <SkeletonDataProduct />
      <SkeletonDataProduct />
      <SkeletonDataProduct />
      <SkeletonDataProduct />
      <SkeletonDataProduct />
      <SkeletonDataProduct />
      <SkeletonDataProduct />
      <SkeletonDataProduct />
      <SkeletonDataProduct />
    </div>
  ) : (
    <div id="data-presentation">
      {productOrder.length === 0 ? (
        <div style={{ margin: Theme.spacing(5), textAlign: 'center' }}>
          <Typography variant="h6" style={{ color: Theme.palette.grey[400] }}>
            No products found to match current filters.
          </Typography>
        </div>
      ) : null}
      {productOrder.slice(0, scrollCutoff).map((productCode, idx) => (
        <DataProduct
          key={productCode}
          productData={products[productCode]}
          bundleParentProductData={(
            products[productCode].bundle.isChild
              ? products[products[productCode].bundle.parent]
              : null
          )}
          descriptionExpanded={productDescriptionExpanded[productCode]}
          isAopViewerProduct={aopViewerProducts.includes(productCode)}
          onExpandProductDescription={onExpandProductDescription}
          onChangeActiveDataVisualization={onChangeActiveDataVisualization}
          highestOrderDownloadSubject={highestOrderDownloadSubject}
        />
      ))}
    </div>
  );
};

export default PresentationData;
