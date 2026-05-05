import React from "react";
import PropTypes from 'prop-types';
import ColumnManager from "../columnmanager/ColumnManager";

function ColumnManagerPresentation(props) {
  const containerStyle = {};
  const {
    columnManagerVisible,
    columns,
    onSetColumns,
    onColumnVisibilityChanged,
    onToggleColumnManagerVisibility,
  } = props;

  if (!columnManagerVisible) {
    containerStyle.display = 'none';
  }

  return (
    <div style={containerStyle}>
      <ColumnManager
        columnManagerVisible={columnManagerVisible}
        columns={columns}
        onSetColumns={onSetColumns}
        onColumnVisibilityChanged={onColumnVisibilityChanged}
        onToggleColumnManagerVisibility={onToggleColumnManagerVisibility}
      />
    </div>
  );
}

ColumnManagerPresentation.propTypes = {
  columnManagerVisible: PropTypes.bool.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  columns: PropTypes.array.isRequired,
  onSetColumns: PropTypes.func.isRequired,
  onColumnVisibilityChanged: PropTypes.func.isRequired,
  onToggleColumnManagerVisibility: PropTypes.func.isRequired,
};

export default ColumnManagerPresentation;
