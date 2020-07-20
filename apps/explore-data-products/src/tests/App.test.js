import React from 'react';
import ReactDOM from 'react-dom';
import Root from '../components/Root';

import { FetchStateType } from "../actions/actions";
import { getState } from "../store/state";

// Modify app fetch state to render main UI from default state
let state = getState();
state.appFetchState = FetchStateType.COMPLETE;

global.it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(
    <Root/>,
    div
  );
});
