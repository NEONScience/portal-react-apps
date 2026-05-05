import React from "react";
import PropTypes from 'prop-types';

import makeStyles from '@mui/styles/makeStyles';

import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import Typography from "@mui/material/Typography";

import { getColumns, getColumnDisplayGroupLabel } from "../../api/dataTableColumns";

const useStyles = makeStyles(() => ({
  paddedSection: {
    '@media (min-width:960px)': {
      marginTop: '35px',
    },
  },
}));

function ColumnManager(props) {
  const {
    columns,
    onSetColumns,
    columnManagerVisible,
    onColumnVisibilityChanged,
    onToggleColumnManagerVisibility,
  } = props;
  const classes = useStyles();

  const renderColumnDisplay = () => {
    if (!columns) { return null; }

    const tableRows = {};
    const displayGroupLabels = {};
    let workingTableRows = null;
    let workingGroupLabel = null;

    columns.forEach((column) => {
      if (!column.title) { return; }

      workingTableRows = tableRows[column.columnDisplayGroup];
      if (!workingTableRows) {
        workingTableRows = [];
      }

      workingGroupLabel = getColumnDisplayGroupLabel(column.columnDisplayGroup);
      if (!displayGroupLabels[workingGroupLabel]) {
        displayGroupLabels[workingGroupLabel] = workingGroupLabel;
      }

      workingTableRows.push(
        <FormControlLabel
          key={`${column.title}-${column.queryName}`}
          style={{ display: 'flex' }}
          data-selenium="column-manager-dialog.column-option"
          control={(
            <Checkbox
              checked={column.visible}
              onChange={onColumnVisibilityChanged}
              name={column.queryName}
              color="primary"
            />
          )}
          label={column.title}
        />,
      );

      tableRows[column.columnDisplayGroup] = workingTableRows;
    });

    const columnSections = Object.keys(tableRows).reduce((acc, value, index) => {
      const labelKey = getColumnDisplayGroupLabel(value);
      acc.push(
        <Grid key={index} item xs={12} sm={6} md={3}>
          {!displayGroupLabels[labelKey] ? null : (
            <Typography variant="subtitle2" gutterBottom style={{ whiteSpace: 'nowrap' }}>
              {displayGroupLabels[labelKey]}
            </Typography>
          )}
          <div className={displayGroupLabels[labelKey] ? null : classes.paddedSection}>
            {tableRows[value]}
          </div>
        </Grid>,
      );
      delete displayGroupLabels[labelKey];
      return acc;
    }, []);

    return (
      <Grid container spacing={3}>
        {columnSections}
      </Grid>
    );
  };

  return (
    <Dialog
      maxWidth="xl"
      open={columnManagerVisible}
      aria-labelledby="column-manager-title"
      data-selenium="column-manager-dialog"
    >
      <DialogTitle id="column-manager-title">
        <Typography variant="h4" style={{ marginTop: '8px' }}>
          Table Columns
        </Typography>
      </DialogTitle>
      <DialogContent>
        {renderColumnDisplay()}
      </DialogContent>
      <DialogActions>
        <Button
          color="primary"
          onClick={() => onSetColumns(getColumns())}
          data-selenium="column-manager-dialog.reset-button"
        >
          Reset to Defaults
        </Button>
        <Button
          color="primary"
          variant="contained"
          onClick={onToggleColumnManagerVisibility}
          data-selenium="column-manager-dialog.close-button"
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

ColumnManager.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  columns: PropTypes.array.isRequired,
  onSetColumns: PropTypes.func.isRequired,
  columnManagerVisible: PropTypes.bool.isRequired,
  onColumnVisibilityChanged: PropTypes.func.isRequired,
  onToggleColumnManagerVisibility: PropTypes.func.isRequired,
};

export default ColumnManager;
