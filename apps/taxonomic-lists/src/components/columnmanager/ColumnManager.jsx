import React from "react";

import { makeStyles } from '@material-ui/core/styles';

import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Grid from '@material-ui/core/Grid';
import Typography from "@material-ui/core/Typography";

import { getColumns, getColumnDisplayGroupLabel } from "../../api/dataTableColumns";

const useStyles = makeStyles(() => ({
  paddedSection: {
    '@media (min-width:960px)': {
      marginTop: '35px',
    },
  },
}));

const ColumnManager = (props) => {
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

    let tableRows = {};
    let displayGroupLabels = {};
    let workingTableRows = null;
    let workingGroupLabel = null;

    columns.forEach((column, index) => {
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
          control={
            <Checkbox
              checked={column.visible}
              onChange={onColumnVisibilityChanged}
              name={column.queryName}
              color="primary"
            />
          }
          label={column.title}
        />
      );

      tableRows[column.columnDisplayGroup] = workingTableRows;
    });

    const columnSections = Object.keys(tableRows).reduce((acc, value, index) => {
      let labelKey = getColumnDisplayGroupLabel(value);
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
        </Grid>
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
      <DialogTitle id="column-manager-title" disableTypography>
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
};

export default ColumnManager;
