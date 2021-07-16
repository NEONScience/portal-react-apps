import React from "react";

import InfoPresentation from "../presentations/InfoPresentation";
import ControlPresentation from "../presentations/ControlPresentation";
import ColumnManagerContainer from "../containers/ColumnManagerContainer";
import DataTableContainer from "../containers/DataTableContainer";

import NeonPage from "portal-core-components/lib/components/NeonPage";

import RouteService from 'portal-core-components/lib/service/RouteService';

const App = () => {
  const breadcrumbs = [
    { name: 'Data & Samples', href: RouteService.getDataSamplesPath() },
    { name: 'Samples & Specimens', href: RouteService.getSamplesPath() },
    { name: "Taxonomic Lists" },
  ];
  return (
    <NeonPage
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
