import React, { Component } from "react";
import CheckBox from "../common/CheckBox";
import { getColumns, getColumnDisplayGroupLabel } from "../../api/dataTableColumns";

import "./ColumnManager.css";

class ColumnManager extends Component {
  constructor(props) {
    super(props);

    this.handleToggleColumnManagerVisibility = this.handleToggleColumnManagerVisibility.bind(this);
    this.handleSetColumns = this.handleSetColumns.bind(this);
  }

  handleToggleColumnManagerVisibility() {
    if (this.props.onToggleColumnManagerVisibility) {
      this.props.onToggleColumnManagerVisibility();
    }
  }

  handleSetColumns() {
    if (this.props.onSetColumns) {
      this.props.onSetColumns(getColumns());
    }
  }

  buildColumnDisplay() {
    if (!this.props.columns) {
      return null;
    }

    let tableRows = {};
    let displayGroupLabels = {};
    let workingTableRows = null;
    let workingGroupLabel = null;
    this.props.columns.forEach((column, index) => {
      if (!column.title) {
        return false;
      }

      workingTableRows = tableRows[column.columnDisplayGroup];
      if (!workingTableRows) {
        workingTableRows = [];
      }

      workingGroupLabel = getColumnDisplayGroupLabel(column.columnDisplayGroup);
      if (!displayGroupLabels[workingGroupLabel]) {
        displayGroupLabels[workingGroupLabel] = workingGroupLabel;
      }

      workingTableRows.push(
        <tr key={index}>
          <td>
            <CheckBox
                containerClassName="column-checkbox-container"
                name={column.title}
                value={column.queryName}
                displayName={column.title}
                checked={column.visible}
                onChange={this.props.onColumnVisibilityChanged}
            />
          </td>
        </tr>
      )

      tableRows[column.columnDisplayGroup] = workingTableRows;
    });

    let tableData = [];
    Object.keys(tableRows).reduce((acc, value, index) => {
      let labelKey = getColumnDisplayGroupLabel(value);
      acc.push(
        <div key={index} className="table-display-columns-container">
          <label className="table-header-label">{displayGroupLabels[labelKey]}</label>
          <table className="table table-display-columns">
            <tbody>
              {tableRows[value]}
            </tbody>
          </table>
        </div>
      );
      delete displayGroupLabels[labelKey];
      return acc;
    }, tableData);

    return tableData;
  }

  render() {
    const containerClassName = "well display-columns-container";
    const containerStyle = {};
    if (!this.props.columnManagerVisible) {
      containerStyle.display = 'none';
    }

    return (
        <div className={containerClassName} style={containerStyle}>
        <h4>Display Columns</h4>
        <button className="btn display-columns-reset-btn"
          onClick={() => {this.handleSetColumns()}}
        >
          Reset
        </button>
        <div className="display-columns-close-container">
          <i className="fa fa-times display-columns-close" aria-hidden="true"
            onClick={() => {this.handleToggleColumnManagerVisibility()}}>
          </i>
        </div>
        <hr />
        {this.buildColumnDisplay()}
      </div>
    )
  }
}

export default ColumnManager;
