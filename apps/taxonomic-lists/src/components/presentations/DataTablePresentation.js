/* eslint-disable max-len */
import React from "react";

import { makeStyles } from '@material-ui/core/styles';

import Theme from 'portal-core-components/lib/components/Theme';

import DataTable from "../datatable/DataTable";

import "bootstrap/dist/css/bootstrap.css";
import "datatables.net-bs/js/dataTables.bootstrap";
import "datatables.net-bs/css/dataTables.bootstrap.css";

/**
   CSS Overrides
   The DataTable component uses Bootstrap as the basis for its CSS. The core components Theme is
   Material UI. Ultimately this component should be reimplemented using Material Table or similar
   (as other tables in react apps are currently). Until that happens this set of CSS overrides
   maintains close-enough visual parity with the current theme.
*/
const useStyles = makeStyles(theme => ({
  root: {
    '& .btn': {
      color: '#fff',
      backgroundColor: theme.palette.primary.main,
      paddingBottom: theme.spacing(1),
      lineHeight: 1.75,
      borderRadius: '2px',
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      boxShadow: '0px 3px 1px -2px rgba(0,0,0,0.2), 0px 2px 2px 0px rgba(0,0,0,0.14), 0px 1px 5px 0px rgba(0,0,0,0.12)',
      '&:hover, &:active': {
        backgroundColor: '#0092e2',
        boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.2), 0px 4px 5px 0px rgba(0,0,0,0.14), 0px 1px 10px 0px rgba(0,0,0,0.12)',
      },
      '& i': {
        marginLeft: theme.spacing(1),
        fontSize: '1rem',
        verticalAlign: 'middle',
      },
      '& span': {
        fontSize: '0.7rem',
        verticalAlign: 'middle',
        fontFamily: '"Inter",Helvetica,Arial,sans-serif',
        fontWeight: '600',
      },
    },
    '& .btn.btn-show-display-columns': {
      marginLeft: theme.spacing(2),
    },
    '& .btn.btn-reset-filters': {
      color: theme.palette.primary.main,
      backgroundColor: '#fff',
      border: `1px solid ${theme.palette.primary.main}`,
      boxShadow: 'none',
      textDecoration: 'none',
      '&:hover, &:active': {
        boxShadow: 'none',
        backgroundColor: 'rgba(0, 115, 207, 0.04)',
        textDecoration: 'underline',
      },
    },
    '& .dataTables_wrapper div.row > div': {
      marginBottom: theme.spacing(3),
      '@media (max-width:767.95px)': {
        display: 'flex',
      },
      '@media (min-width:768px)': {
        '&.datatable-row-container': {
          overflowX: 'scroll',
        },
      }
    },
    '& .dataTables_filter > label': {
      margin: 0,
    },
    '& .dataTables_length > label': {
      margin: 0,
    },
    '& .toggle-columns': {
      display: 'flex',
      '@media (max-width:767.95px)': {
        justifyContent: 'flex-start',
      },
      '@media (min-width:768px)': {
        justifyContent: 'flex-end',
      },
    },
    '& .dataTables_info': {
      fontWeight: 600,
      fontSize: '0.9rem',
    },
    '& label.label-no-data': {
      fontWeight: 400,
      fontStyle: 'italic',
      color: theme.palette.grey[300],
    },
    '& li.paginate_button a': {
      borderColor: theme.palette.primary.main,
      textDecoration: 'none !important',
      fontSize: '0.7rem',
      fontFamily: '"Inter",Helvetica,Arial,sans-serif',
      fontWeight: '600',
      lineHeight: 1.75,
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
    },
    '& li.paginate_button.disabled a': {
      color: theme.palette.grey[300],
      borderColor: theme.palette.primary.light,
      // borderColor: theme.palette.grey[200],
    },
    '& li.paginate_button.active a': {
      color: '#fff',
    },
    '& table': {
      width: '100%',
      display: 'table',
      borderSpacing: 0,
      borderCollapse: 'collapse !important',
      border: 'none',
      margin: '0px !important',
    },
    '& thead': {
      '& th.sorting:after': {
        opacity: '0.45 !important',
      },
      '& th.sorting_asc:after, th.sorting_desc:after': {
        opacity: '0.9 !important',
      },
      '& tr': {
        verticalAlign: 'middle',
        '& th:not(:last-child)': {
          borderRight: `1px solid ${theme.palette.secondary.main}`,
        },
        '& th': {
          color: '#fff',
          fontWeight: 600,
          lineHeight: '1.5rem',
          borderBottom: `1.5px solid ${theme.palette.secondary.main}`,
          backgroundColor: theme.palette.primary.main,
          '& input': {
            padding: theme.spacing(0.25, 1),
            marginTop: theme.spacing(1),
          },
        },
      },
    },
    '& tbody': {
      '& tr': {
        '& td:last-child': {
          borderRightWidth: '0px !important',
        },
      },
    },
    '& ul.pagination': {
      margin: 0,
    },
  },
}));

const DataTablePresentation = (props) => {
  const { taxonQuery, columns, onToggleColumnManagerVisibility } = props;
  const classes = useStyles(Theme);
  return (
    <div className={classes.root} data-selenium="table-section">
      <DataTable
        taxonQuery={taxonQuery}
        columns={columns}
        onToggleColumnManagerVisibility={onToggleColumnManagerVisibility}
      />
    </div>
  );
};

export default DataTablePresentation;
