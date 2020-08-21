import React, { Component } from "react";
import DataTable from "../datatable/DataTable";
//import AgGridDataTable from "../datatable/AgGridDataTable";

import "bootstrap/dist/css/bootstrap.css";
import "datatables.net-bs/js/dataTables.bootstrap";
import "datatables.net-bs/css/dataTables.bootstrap.css";
import "font-awesome/css/font-awesome.min.css";

class DataTablePresentation extends Component {
  render() {
    return (
      <div className="taxon-data-table">
        <DataTable
          taxonQuery={this.props.taxonQuery}
          columns={this.props.columns}
          onToggleColumnManagerVisibility={this.props.onToggleColumnManagerVisibility}
        />
      </div>
    );
  }
}

export default DataTablePresentation;
