import React from 'react';
import { ReplaySubject } from 'rxjs';

import NeonContext from 'portal-core-components/lib/components/NeonContext';

import ContainerTop from './ContainerTop/ContainerTop';

// Create a ReplaySubject for broadcasting the higher order download state out to
// all download contexts. ReplaySubject(1) pushes the one latest value in the observable
// to new subscribers on subscription. This allows new individual product contexts
// to immediately have the last higher-order download state pushed to them when they're
// created (e.g. through scrolling, filtering, etc.). Do this here so that the ReplaySubject
// is invoked exactly once at initiation, but not kept in state.
const highestOrderDownloadSubject = new ReplaySubject(1);

// NOTE: Why wrap the app in a NeonContext.Provider here? Normally this is an automatic feature of
// NeonPage. But in PresentationTop, where we invoke NeonPage, we also have an effect to monitor
// the fetch status of the supposedly-already-existing NeonContext (to factor it into the overall
// explore page load status). Thus we need to invoke NeonContext at a higher-order level (here).
const App = () => (
  <NeonContext.Provider useCoreAuth>
    <div className="App">
      <ContainerTop highestOrderDownloadSubject={highestOrderDownloadSubject} />
    </div>
  </NeonContext.Provider>
);

export default App;
