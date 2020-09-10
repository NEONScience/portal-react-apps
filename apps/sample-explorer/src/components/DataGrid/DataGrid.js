import React, { Component } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-balham.css";

class DataGrid extends Component {

  constructor(props) {
    super(props);
    this.state = {
      columnDefs: this.props.tableDefinition,
      rowData: this.props.tableData,
      sampleUuid: this.props.sampleUuid
    }
    this.onGridReady = this.onGridReady.bind(this)
  }

  onGridReady(params) {
    this.api = params.api;
    this.columnApi = params.columnApi;
    params.api.sizeColumnsToFit();
  }
  componentDidUpdate() {
    if (this.api !== null && typeof this.api !== "undefined") {
      this.api.setColumnDefs(this.props.tableDefinition);
      this.api.redrawRows();
    }
  }

  render() {
    let containerStyle = {
      height: "280px",
      width: "100%"
    };

    return (
      <div style={containerStyle} className="ag-theme-balham">
        <AgGridReact
          // properties
          columnDefs={this.props.tableDefinition}
          rowData={this.props.tableData}
          // events
          onGridReady={this.onGridReady}
        />
      </div>
    )
  }
}

export default DataGrid;
