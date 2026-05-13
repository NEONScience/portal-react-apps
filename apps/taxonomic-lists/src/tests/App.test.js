import { createRoot } from 'react-dom/client';
import React from 'react';
import { Provider } from 'react-redux';
import $ from 'jquery';

import App from '../components/app/App';
import store from '../store/store';

// Mock the data table function
$.DataTable();

global.it('renders without crashing', () => {
  const div = document.createElement('div');
  const root = createRoot(div);

  root.render(
    <Provider store={store}>
      <App />
    </Provider>,
  );
});
