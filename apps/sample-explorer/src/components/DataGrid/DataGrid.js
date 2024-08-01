import React, { Component } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-balham.css";

class DataGrid extends Component {
  constructor(props) {
    super(props);
    this.state = {
      columnDefs: this.props.columnDefs,
      rowData: this.props.rowData,
      uuid: this.props.uuid,
      isLoading: this.props.isLoading,
    };
    this.onGridReady = this.onGridReady.bind(this);
  }

  handleLoading() {
    this.api.setGridOption("loading", this.props.isLoading === true ? true : false);
  }

  onGridReady(params) {
    this.api = params.api;
    this.columnApi = params.columnApi;
    params.api.sizeColumnsToFit();
    this.handleLoading();
  }
  componentDidUpdate() {
    if (this.api !== null && typeof this.api !== "undefined") {
      this.handleLoading();
      this.api.updateGridOptions({ columnDefs: this.props.columnDefs })
      this.api.redrawRows();
      this.api.hideOverlay();
      if (!this.props.rowData || this.props.rowData.length <= 0) {
        this.api.showNoRowsOverlay();
      }
    }
  }

  render() {
    let containerStyle = {
      height: "280px",
      width: "100%",
    };
    if (typeof this.props.height === 'string') {
      containerStyle.height = this.props.height;
    }
    return (
      <div style={containerStyle} className="ag-theme-balham">
        <AgGridReact
          enableCellTextSelection
          // properties
          columnDefs={this.props.columnDefs}
          rowData={this.props.rowData}
          // events
          onGridReady={this.onGridReady}
        />
      </div>
    )
  }
}

export default DataGrid;
