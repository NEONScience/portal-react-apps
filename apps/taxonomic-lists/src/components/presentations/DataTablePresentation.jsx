import React from 'react';
import PropTypes from 'prop-types';

import { makeStyles } from 'portal-core-components/lib/components/Theme/makeStyles';

import TaxonDataTable from '../datatable/TaxonDataTable';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'datatables.net-bs5/css/dataTables.bootstrap5.css';
import 'datatables.net-responsive-bs5/css/responsive.bootstrap5.css';

const useStyles = makeStyles()((theme) => ({
  root: {
    '& .table-actions': {
      display: 'flex',
      justifyContent: 'flex-end',
      flexWrap: 'wrap',
      gap: theme.spacing(2),
      marginBottom: theme.spacing(3),
      '@media (max-width:767.95px)': {
        justifyContent: 'flex-start',
      },
    },
    '& .table-actions .btn': {
      color: '#fff',
      backgroundColor: theme.palette.primary.main,
      padding: theme.spacing(1, 2),
      lineHeight: 1.75,
      borderRadius: '2px',
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      border: 0,
      boxShadow: `
        0 3px 1px -2px rgba(0, 0, 0, 0.2),
        0 2px 2px 0 rgba(0, 0, 0, 0.14),
        0 1px 5px 0 rgba(0, 0, 0, 0.12)
      `,
      '&:hover, &:active, &:focus-visible': {
        color: '#fff',
        backgroundColor: '#0092e2',
        boxShadow: `
          0 2px 4px -1px rgba(0, 0, 0, 0.2),
          0 4px 5px 0 rgba(0, 0, 0, 0.14),
          0 1px 10px 0 rgba(0, 0, 0, 0.12)
        `,
      },
      '& i': {
        marginLeft: theme.spacing(1),
        fontSize: '1rem',
        verticalAlign: 'middle',
      },
      '& span': {
        fontSize: '0.7rem',
        verticalAlign: 'middle',
        fontFamily: '"Inter", Helvetica, Arial, sans-serif',
        fontWeight: 600,
      },
    },
    '& .table-actions .btn-reset-filters': {
      color: theme.palette.primary.main,
      backgroundColor: '#fff',
      border: `1px solid ${theme.palette.primary.main}`,
      boxShadow: 'none',
      textDecoration: 'none',
      '&:hover, &:active, &:focus-visible': {
        color: theme.palette.primary.main,
        backgroundColor: 'rgba(0, 115, 207, 0.04)',
        boxShadow: 'none',
        textDecoration: 'underline',
      },
    },
    '& .dt-container': {
      width: '100%',
    },
    '& .dt-container .dt-layout-row': {
      alignItems: 'center',
      marginTop: 0,
      marginBottom: theme.spacing(3),
    },
    '& .dt-container .dt-layout-cell': {
      paddingTop: 0,
      paddingBottom: 0,
    },
    '& .dt-container .dt-layout-table': {
      width: '100%',
      maxWidth: '100%',
      overflowX: 'auto',
      overflowY: 'hidden',
      '--bs-gutter-x': '0',
    },
    '& .dt-search, & .dt-length': {
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing(1),
    },
    '& .dt-search': {
      justifyContent: 'flex-end',
      '@media (max-width:767.95px)': {
        justifyContent: 'flex-start',
      },
    },
    '& .dt-search label, & .dt-length label': {
      margin: 0,
      whiteSpace: 'nowrap',
    },
    '& .dt-search input': {
      width: '315px',
      maxWidth: '100%',
      marginLeft: '0 !important',
    },
    '& .dt-info': {
      paddingTop: '0 !important',
      fontWeight: 600,
      fontSize: '0.9rem',
    },
    '& .dt-paging .pagination': {
      justifyContent: 'flex-end',
      margin: 0,
    },
    '& .dt-paging .page-link': {
      color: theme.palette.primary.main,
      borderColor: theme.palette.primary.main,
      textDecoration: 'none !important',
      fontSize: '0.7rem',
      fontFamily: '"Inter", Helvetica, Arial, sans-serif',
      fontWeight: 600,
      lineHeight: 1.75,
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
    },
    '& .dt-paging .page-item.disabled .page-link': {
      color: theme.palette.grey[400],
      borderColor: theme.palette.primary.light,
    },
    '& .dt-paging .page-item.active .page-link': {
      color: '#fff',
      backgroundColor: theme.palette.primary.main,
      borderColor: theme.palette.primary.main,
    },
    '& .dt-processing': {
      position: 'absolute',
      top: '140px',
      left: '50%',
      width: '200px',
      padding: theme.spacing(3),
      textAlign: 'center',
    },
    '& .dt-processing > div': {
      display: 'none',
    },
    '& table.dataTable': {
      width: '100% !important',
      display: 'table',
      borderSpacing: 0,
      borderCollapse: 'collapse !important',
      border: 'none',
      margin: '0 !important',
      '--dt-order-arrow_color': '#fff',
      '--dt-order-arrow_color-current': '#fff',
    },
    '& table.dataTable thead tr:first-of-type': {
      verticalAlign: 'middle',
      '& th': {
        color: '#fff',
        fontWeight: 600,
        lineHeight: '1.5rem',
        backgroundColor: theme.palette.primary.main,
      },
      '& th:not(:last-of-type)': {
        borderRight: `1px solid ${theme.palette.secondary.main}`,
      },
    },
    '& table.dataTable thead th .dt-column-order': {
      opacity: '1 !important',
    },
    '& table.dataTable thead th .dt-column-order:before': {
      opacity: '0.45 !important',
    },
    '& table.dataTable thead th .dt-column-order:after': {
      opacity: '0.45 !important',
    },
    '& table.dataTable thead th.dt-ordering-asc .dt-column-order:before': {
      opacity: '1 !important',
    },
    '& table.dataTable thead th.dt-ordering-desc .dt-column-order': {
      opacity: '1 !important',
    },
    '& table.dataTable thead th.dt-ordering-desc .dt-column-order:after': {
      opacity: '1 !important',
    },
    '& table.dataTable thead tr.header-filter-row': {
      verticalAlign: 'middle',
      '& th': {
        padding: theme.spacing(1),
        textAlign: 'center',
        backgroundColor: 'rgb(245, 246, 247)',
      },
      '& th:not(:last-of-type)': {
        borderRight: `1px solid ${theme.palette.secondary.main}`,
      },
      '& th:first-of-type': {
        borderLeft: 'none',
      },
      '& th:last-of-type': {
        borderRight: 'none',
      },
      '& input': {
        width: '100%',
        minWidth: '80px',
        margin: 0,
        padding: theme.spacing(0.25, 1),
        color: theme.palette.text.primary,
        fontSize: '0.75rem',
        fontWeight: 400,
        borderColor: 'rgba(0, 0, 0, 0.23)',
      },
    },
    '& table.dataTable thead tr.header-filter-row th .column-filter-input': {
      position: 'relative',
    },
    '& table.dataTable thead tr.header-filter-row th .column-filter-input input': {
      paddingLeft: '2rem',
    },
    '& table.dataTable thead tr.header-filter-row th .column-filter-input-icon': {
      position: 'absolute',
      top: '50%',
      left: '0.5rem',
      zIndex: 1,
      color: 'rgba(0, 0, 0, 0.5)',
      pointerEvents: 'none',
      transform: 'translateY(-50%)',
    },
    '& table.dataTable tbody tr': {
      borderBottomColor: theme.palette.grey[200],
    },
    '& table.dataTable tbody td': {
      borderRightColor: theme.palette.grey[200],
    },
    '& table.dataTable tbody td:first-of-type': {
      borderLeftWidth: '0 !important',
    },
    '& table.dataTable tbody td:last-of-type': {
      borderRightWidth: '0 !important',
    },
    '& table.dataTable tbody td.dt-empty': {
      color: theme.palette.grey[400],
      fontWeight: 400,
      fontStyle: 'italic',
    },
    '& table.dataTable tbody td label.label-no-data': {
      color: theme.palette.grey[400],
      fontWeight: 400,
      fontStyle: 'italic',
    },
    '@media (max-width:767.95px)': {
      '& .dt-container .dt-layout-row': {
        gap: theme.spacing(2),
      },
      '& .dt-container .dt-layout-cell': {
        width: '100%',
      },
      '& .dt-paging .pagination': {
        justifyContent: 'flex-end',
      },
    },
  },
}));

const DataTablePresentation = (props) => {
  const { taxonQuery, columns, onToggleColumnManagerVisibility } = props;
  const { classes } = useStyles();
  return (
    <div className={classes.root} data-selenium="table-section">
      <TaxonDataTable
        taxonQuery={taxonQuery}
        columns={columns}
        onToggleColumnManagerVisibility={onToggleColumnManagerVisibility}
      />
    </div>
  );
};

DataTablePresentation.propTypes = {
  taxonQuery: PropTypes.shape({
    taxonTypeCode: PropTypes.string.isRequired,
    locationName: PropTypes.string,
    rootApiUrl: PropTypes.string.isRequired,
  }).isRequired,
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      queryName: PropTypes.string,
      title: PropTypes.string.isRequired,
      visible: PropTypes.bool,
    }),
  ).isRequired,
  onToggleColumnManagerVisibility: PropTypes.func.isRequired,
};

export default DataTablePresentation;
