import React from "react";
import DataTable from "../datatable/DataTable";

import "bootstrap/dist/css/bootstrap.css";
import "datatables.net-bs/js/dataTables.bootstrap";
import "datatables.net-bs/css/dataTables.bootstrap.css";
import "font-awesome/css/font-awesome.min.css";

const DataTablePresentation = (props) => {
  const { taxonQuery, columns, onToggleColumnManagerVisibility } = props;
  return (
    <div className="taxon-data-table">
      <DataTable
        taxonQuery={taxonQuery}
        columns={columns}
        onToggleColumnManagerVisibility={onToggleColumnManagerVisibility}
      />
    </div>
  );
};

export default DataTablePresentation;
