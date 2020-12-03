import React from "react";

import InfoPresentation from "../presentations/InfoPresentation";
import ControlPresentation from "../presentations/ControlPresentation";
import ColumnManagerContainer from "../containers/ColumnManagerContainer";
import DataTableContainer from "../containers/DataTableContainer";

import NeonPage from "portal-core-components/lib/components/NeonPage";

const App = () => {
  const breadcrumbs = [
    { name: 'Data & Samples', href: 'https://www.neonscience.org/data-samples/' },
    { name: 'Samples & Specimens', href: 'https://www.neonscience.org/samples/' },
    { name: "Taxonomic Lists" },
  ];
  return (
    <NeonPage
      title="Taxonomic Lists"
      breadcrumbs={breadcrumbs}
      breadcrumbHomeHref="https://www.neonscience.org/"
    >
      <InfoPresentation />
      <ControlPresentation />
      <ColumnManagerContainer />
      <DataTableContainer />
    </NeonPage>
  );
};

export default App;
