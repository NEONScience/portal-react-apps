import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-balham.css';

class DataGrid extends Component {
  constructor(props) {
    super(props);
    this.onGridReady = this.onGridReady.bind(this);
  }

  componentDidUpdate() {
    const { columnDefs, rowData } = this.props;
    if (this.api !== null && typeof this.api !== 'undefined') {
      this.handleLoading();
      this.api.updateGridOptions({ columnDefs });
      this.api.redrawRows();
      this.api.hideOverlay();
      if (!rowData || rowData.length <= 0) {
        this.api.showNoRowsOverlay();
      }
    }
  }

  handleLoading() {
    const { isLoading } = this.props;
    this.api.setGridOption('loading', isLoading === true);
  }

  onGridReady(params) {
    this.api = params.api;
    params.api.sizeColumnsToFit();
    this.handleLoading();
  }

  render() {
    const { columnDefs, rowData } = this.props;
    const containerStyle = {
      height: '280px',
      width: '100%',
    };
    const { height } = this.props;
    if (typeof height === 'string') {
      containerStyle.height = height;
    }
    return (
      <div style={containerStyle} className="ag-theme-balham">
        <AgGridReact
          enableCellTextSelection
          // properties
          columnDefs={columnDefs}
          rowData={rowData}
          // events
          onGridReady={this.onGridReady}
        />
      </div>
    );
  }
}

DataGrid.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  columnDefs: PropTypes.array.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  rowData: PropTypes.array.isRequired,
  isLoading: PropTypes.bool.isRequired,
  height: PropTypes.string.isRequired,
};

export default DataGrid;
