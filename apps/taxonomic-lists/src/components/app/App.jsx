import React from 'react';

import NeonPage from '@neonscience/portal-core-components/components/NeonPage';

import RouteService from '@neonscience/portal-core-components/service/RouteService';

import InfoPresentation from '../presentations/InfoPresentation';
import ControlPresentation from '../presentations/ControlPresentation';
import ColumnManagerContainer from '../containers/ColumnManagerContainer';
import DataTableContainer from '../containers/DataTableContainer';

const App = () => {
  const breadcrumbs = [
    { name: 'Data', href: RouteService.getDataSamplesDataPath() },
    { name: 'Samples & Specimens', href: RouteService.getSamplesPath() },
    { name: 'Taxonomic Lists' },
  ];
  return (
    <NeonPage
      useCoreAuth
      customizeAuthContainer
      title="Taxonomic Lists"
      breadcrumbs={breadcrumbs}
      breadcrumbHomeHref={RouteService.getWebHomePath()}
    >
      <InfoPresentation />
      <ControlPresentation />
      <ColumnManagerContainer />
      <DataTableContainer />
    </NeonPage>
  );
};

export default App;
