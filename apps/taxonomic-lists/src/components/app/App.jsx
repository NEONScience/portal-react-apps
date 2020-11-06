import React from "react";

import InfoPresentation from "../presentations/InfoPresentation";
import ControlPresentation from "../presentations/ControlPresentation";
import ColumnManagerContainer from "../containers/ColumnManagerContainer";
import DataTableContainer from "../containers/DataTableContainer";

import NeonPage from "portal-core-components/lib/components/NeonPage";

const App = () => {
  const breadcrumbs = [
    { name: "Taxonomic Lists" },
  ];
  return (
    <NeonPage
      title="Taxonomic Lists"
      breadcrumbs={breadcrumbs}
    >
      <InfoPresentation />
      <ControlPresentation />
      <ColumnManagerContainer />
      <DataTableContainer />
    </NeonPage>
  );
};

export default App;
