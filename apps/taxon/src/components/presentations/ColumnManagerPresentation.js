import React, { Component } from "react";
import ColumnManager from "../columnmanager/ColumnManager";

class ColumnManagerPresentation extends Component {
  render() {
    const containerStyle = {};

    if (!this.props.columnManagerVisible) {
      containerStyle.display = 'none';
    }

    return (
      <div style={containerStyle}>
        <ColumnManager
          columnManagerVisible={this.props.columnManagerVisible}
          columns={this.props.columns}
          onSetColumns={this.props.onSetColumns}
          onColumnVisibilityChanged={this.props.onColumnVisibilityChanged}
          onToggleColumnManagerVisibility={this.props.onToggleColumnManagerVisibility}
        />
      </div>
    );
  }
}

export default ColumnManagerPresentation;
