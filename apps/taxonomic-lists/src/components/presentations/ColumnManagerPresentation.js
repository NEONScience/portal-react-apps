import React from 'react';
import PropTypes from 'prop-types';
import ColumnManager from '../columnmanager/ColumnManager';

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
  columns: PropTypes.arrayOf(PropTypes.shape({
    bVisible: PropTypes.bool,
    columnDisplayGroup: PropTypes.string,
    data: PropTypes.string,
    defaultContent: PropTypes.string,
    mData: PropTypes.string,
    queryName: PropTypes.string,
    sDefaultContent: PropTypes.string,
    sTitle: PropTypes.string,
    title: PropTypes.string,
    visible: PropTypes.bool,
  })).isRequired,
  onSetColumns: PropTypes.func.isRequired,
  onColumnVisibilityChanged: PropTypes.func.isRequired,
  onToggleColumnManagerVisibility: PropTypes.func.isRequired,
};

export default ColumnManagerPresentation;
