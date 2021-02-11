/* eslint-disable import/no-unresolved */
import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
} from 'react';
import PropTypes from 'prop-types';

import logger from 'use-reducer-logger';

import cloneDeep from 'lodash/cloneDeep';

import NeonApi from 'portal-core-components/lib/components/NeonApi';

const FETCH_STATUS = {
  AWAITING_CALL: 'AWAITING_CALL',
  FETCHING: 'FETCHING',
  ERROR: 'ERROR',
  SUCCESS: 'SUCCESS',
};

const APP_STATUS = {
  INITIALIZING: 'INITIALIZING',
  FETCHING: 'FETCHING',
  READY: 'READY',
  ERROR: 'ERROR',
};

/**
   STATE
*/
const DEFAULT_STATE = {
  app: {
    status: APP_STATUS.INITIALIZING,
    error: null,
  },
  datasetsFetch: {
    status: FETCH_STATUS.AWAITING_CALL,
    error: null,
  },
  datasets: null,
};

/**
   CONTEXT
*/
const Context = createContext(DEFAULT_STATE);

/**
   HOOK
*/
const usePrototypeContextState = () => {
  const hookResponse = useContext(Context);
  if (hookResponse.length !== 2) {
    return [cloneDeep(DEFAULT_STATE), () => {}];
  }
  return hookResponse;
};

/**
   REDUCER
*/
const reducer = (state, action) => {
  const newState = { ...state };
  const errorDetail = (
    !action.error ? null
      : ((action.error.response || {}).error || {}).detail || action.error.message || null
  );

  switch (action.type) {
    case 'reinitialize':
      return cloneDeep(DEFAULT_STATE);
    case 'error':
      newState.app.status = APP_STATUS.ERROR;
      newState.app.error = action.error;
      return newState;

    case 'fetchDatasetsStarted':
      newState.datasetsFetch.status = FETCH_STATUS.FETCHING;
      newState.app.status = APP_STATUS.FETCHING;
      return newState;
    case 'fetchDatasetsFailed':
      newState.datasetsFetch.status = FETCH_STATUS.ERROR;
      newState.datasetsFetch.error = action.error;
      newState.app.status = APP_STATUS.ERROR;
      newState.app.error = errorDetail;
      return newState;
    case 'fetchDatasetsSucceeded':
      newState.datasetsFetch.status = FETCH_STATUS.SUCCESS;
      newState.datasets = action.data;
      newState.app.status = APP_STATUS.READY;
      return newState;

    // Default
    default:
      return state;
  }
};

/**
   PROVIDER
*/
const Provider = (props) => {
  const { children } = props;

  const initialState = cloneDeep(DEFAULT_STATE);
  const [state, dispatch] = useReducer(
    process.env.NODE_ENV === 'development' ? logger(reducer) : reducer,
    initialState,
  );

  const {
    app: { status: appStatus },
    datasetsFetch: { status: datasetsFetchStatus },
  } = state;

  /**
     Effects
  */
  // Trigger initial prototype datasets fetch
  useEffect(() => {
    if (
      appStatus !== APP_STATUS.INITIALIZING
        || datasetsFetchStatus !== FETCH_STATUS.AWAITING_CALL
    ) { return; }
    NeonApi.getPrototypeDatasetsObservable().subscribe(
      (response) => {
        dispatch({ type: 'fetchDatasetsSucceeded', data: response.data });
      },
      (error) => {
        dispatch({ type: 'fetchDatasetsFailed', error });
      },
    );
    dispatch({ type: 'fetchDatasetsStarted' });
  });

  /**
     Render
  */
  return (
    <Context.Provider value={[state, dispatch]}>
      {children}
    </Context.Provider>
  );
};

Provider.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.oneOfType([
      PropTypes.node,
      PropTypes.string,
    ])),
    PropTypes.node,
    PropTypes.string,
  ]).isRequired,
};

Provider.defaultProps = {};

/**
   EXPORT
*/
const PrototypeContext = {
  Provider,
  usePrototypeContextState,
  APP_STATUS,
  DEFAULT_STATE,
};

export default PrototypeContext;
