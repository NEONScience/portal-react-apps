import React, { useReducer, useEffect } from 'react';
import PropTypes from 'prop-types';

import { ReplaySubject } from 'rxjs';

import cloneDeep from 'lodash/cloneDeep';

import Typography from '@material-ui/core/Typography';

import DownloadDataContext from 'portal-core-components/lib/components/DownloadDataContext';
import Theme from 'portal-core-components/lib/components/Theme';
import { LATEST_AND_PROVISIONAL } from 'portal-core-components/lib/service/ReleaseService';

import DataProduct from './DataProduct';
import SkeletonDataProduct from './SkeletonDataProduct';

import ExploreContext from '../ExploreContext';

const PresentationData = (props) => {
  const { skeleton, highestOrderDownloadSubject } = props;

  const [state] = ExploreContext.useExploreContextState();
  const {
    scrollCutoff,
    currentProducts: { release: currentRelease, order: productOrder },
  } = state;

  /**
   * Download Higher Order State Management
   */
  // Initialize state at the PresentationData component level for keeping the last
  const initialDownloadState = cloneDeep(DownloadDataContext.DEFAULT_STATE);
  if (currentRelease !== LATEST_AND_PROVISIONAL) {
    initialDownloadState.release.value = currentRelease;
    initialDownloadState.release.validValues = [currentRelease];
    initialDownloadState.release.isValid = true;
  }

  // Define a simple reducer for handling whole changes to the download state
  const downloadReducer = (reducerState, action) => {
    switch (action.type) {
      case 'setDownloadState':
        return action.downloadState;
      case 'reinitializeDownloadState':
        return { ...initialDownloadState, broadcast: true };
      default:
        return DownloadDataContext.reducer(reducerState, action);
    }
  };
  const [downloadState, downloadDispatch] = useReducer(downloadReducer, initialDownloadState);

  // Effect to reinitialize download state when explore context release differs. This difference
  // signals an app-level release change and for simplicity we do not preserve any broadcastable
  // download selections when changing release.
  useEffect(() => {
    if (
      (downloadState.release.value === null && currentRelease === LATEST_AND_PROVISIONAL)
        || downloadState.release.value === currentRelease
    ) { return; }
    downloadDispatch({ type: 'reinitializeDownloadState' });
  }, [currentRelease, downloadState.release.value]);

  // Effect to broadcast the higher order download state out on the
  // main observable to be picked up by subscribed contexts whenever the broadcast
  // boolean is true (signifying a change worthy of going out across the board)
  useEffect(() => {
    if (downloadState && downloadState.broadcast) {
      highestOrderDownloadSubject.next(downloadState);
      downloadDispatch({ type: 'setBroadcastDone' });
    }
  }, [downloadState, highestOrderDownloadSubject]);

  // Effect to listen to updates broadcast from within a single download
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
      {productOrder.slice(0, scrollCutoff).map((productCode) => (
        <DataProduct
          key={`${productCode}/${currentRelease || ''}`}
          productCode={productCode}
          highestOrderDownloadSubject={highestOrderDownloadSubject}
        />
      ))}
    </div>
  );
};

PresentationData.propTypes = {
  skeleton: PropTypes.bool,
  highestOrderDownloadSubject: PropTypes.instanceOf(ReplaySubject).isRequired,
};

PresentationData.defaultProps = {
  skeleton: false,
};

export default PresentationData;
