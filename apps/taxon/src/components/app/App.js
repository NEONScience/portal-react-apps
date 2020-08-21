import React, { Component } from "react";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";

import InfoPresentation from "../presentations/InfoPresentation";
import ControlPresentation from "../presentations/ControlPresentation";
import ColumnManagerContainer from "../containers/ColumnManagerContainer";
import DataTableContainer from "../containers/DataTableContainer";

import NeonPage from "portal-core-components/lib/components/NeonPage";

import "./App.css";
import "./AppLayout.css";

class App extends Component {
  render() {
    const breadcrumbs = [
      { name: "Taxonomic Lists" },
    ];
    return (
      <div className="App layout">
        <NeonPage
          useCoreHeader
          breadcrumbs={breadcrumbs}
        >
          <div className="taxon-container">
            <Grid container spacing={3} style={{ marginTop: "2px" }}>
              <Grid item xs={12}>
                <InfoPresentation />
              </Grid>
              <Grid item xs={12}>
                <Paper className="paper-container">
                  <ControlPresentation />
                  <ColumnManagerContainer />
                  <DataTableContainer />
                </Paper>
              </Grid>
            </Grid>
          </div>
        </NeonPage>
      </div>
    );
  }
}

export default App;
