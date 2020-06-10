import React from 'react';
import { ReplaySubject } from 'rxjs';

import ContainerTop from './ContainerTop/ContainerTop';

// Create a ReplaySubject for broadcasting the higher order download state out to
// all download contexts. ReplaySubject(1) pushes the one latest value in the observable
// to new subscribers on subscription. This allows new individual product contexts
// to immediately have the last higher-order download state pushed to them when they're
// created (e.g. through scrolling, filtering, etc.). Do this here so that the ReplaySubject
// is invoked exactly once at initiation, but not kept in state.
const highestOrderDownloadSubject = new ReplaySubject(1);

const App = () => (
  <div className="App">
    <ContainerTop highestOrderDownloadSubject={highestOrderDownloadSubject} />
  </div>
);

export default App;
