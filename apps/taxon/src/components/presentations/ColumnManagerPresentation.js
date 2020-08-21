import React, { Component } from "react";
import ColumnManager from "../columnmanager/ColumnManager";

class ColumnManagerPresentation extends Component {
  render() {
    let containerClassName = "";

    if (!this.props.columnManagerVisible) {
      containerClassName += " hidden-element";
    }

    return (
      <div className={containerClassName}>
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
