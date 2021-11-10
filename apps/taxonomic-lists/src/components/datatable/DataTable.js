/* eslint-disable max-len */
import React, { Component } from "react";

import NeonEnvironment from "portal-core-components/lib/components/NeonEnvironment/NeonEnvironment";
import NeonApi from "portal-core-components/lib/components/NeonApi";

import "./DataTable.css";

const _ = require("lodash");
const $ = require("jquery");
$.DataTable = require("datatables.net-responsive-bs");

const DataTableUpdateType = {
  FULL: "FULL",
  COLUMN_VISIBILITY: "COLUMN_VISIBILITY",
};

class DataTable extends Component {
  constructor(props) {
    super(props);

    this.updateType = DataTableUpdateType.FULL;
    this.columnsVisibilityChanged = null;

    this.handleToggleColumnManagerVisibility = this.handleToggleColumnManagerVisibility.bind(this)

    this.queryFilter = {
      search: {
        term: null,
        columns: []
      },
      filterColumns: {},
      orderByColumns: {}
    };
  }

  componentDidMount() {
    this.initDataTable();
    this.initDataTableActions();
    this.initDataTableColumnFilters();

    this.updateData();
  }

  componentWillUnmount() {
    $(this.dataTable).DataTable().destroy(true);
  }

  shouldComponentUpdate(nextProps) {
    let shouldUpdate = true;
    this.updateType = DataTableUpdateType.FULL;

    // Assumes order for efficiency
    if (this.props.columns.length === nextProps.columns.length) {
      this.columnsVisibilityChanged = nextProps.columns.reduce((acc, value, index) => {
        if ((this.props.columns[index].queryName === value.queryName)
            && (this.props.columns[index].visible !== value.visible)) {
          this.updateType = DataTableUpdateType.COLUMN_VISIBILITY;
          acc[value.queryName] = value;
        }

        return acc;
      }, {});

      // If no columns visibilities were changed, no need to update
      if (Object.keys(this.columnsVisibilityChanged).length <= 0) {
        shouldUpdate = false;
      }
    }

    // Always update when taxon query parameters are modified
    if ((this.props.taxonQuery.taxonTypeCode !== nextProps.taxonQuery.taxonTypeCode)
        || (this.props.taxonQuery.locationName !== nextProps.taxonQuery.locationName)) {
      shouldUpdate = true;
      this.updateType = DataTableUpdateType.FULL;
    }

    return shouldUpdate;
  }

  componentDidUpdate() {
    if (this.updateType === DataTableUpdateType.COLUMN_VISIBILITY) {
      this.toggleColumnVisibility(this.columnsVisibilityChanged);
      this.columnsVisibilityChanged = null;
    } else {
      this.updateData();
    }
  }

  initDataTable() {
    let that = this;
    $(this.dataTable).DataTable({
      dom: "<'row'<'col-xs-12 col-sm-5 col-md-5 col-lg-5 pull-right toggle-columns'>>" +
           "<'row'<'col-sm-6 page-length-container'l><'col-sm-6 keyword-search'f>>" +
           "<'row'<'col-sm-5'i><'col-sm-7'p>>" +
           "<'row'<'col-sm-12 datatable-row-container'tr>>" +
           "<'row'<'col-sm-5'i><'col-sm-7'p>>",
      columns: this.props.columns,
      order: [[ 0, "asc" ]],
      pageLength: 100,
      lengthMenu: [10, 50, 100],
      ordering: true,
      searching: true,
      searchDelay: 400,
      deferLoading: 0,
      processing: true,
      language: {
        search: "Keyword Search:",
        processing: "<i class=\"fa fa-circle-o-notch fa-spin fa-2x fa-fw margin-bottom\"></i>"
      },
      serverSide: true,
      ajax: that.getDataTableAjax()
    });
  }

  initDataTableColumnFilters() {
    let that = this;
    $(this.dataTable).find("thead th").each(function () {
      that.prohibitColumnHeaderKeyEvents(this);
      let col = that.findColumnByTitle(this.innerHTML);
      if (col) {
        $(this).append(that.getColumnFilterInput(col.column.queryName, col.index));
      }
    });
  }

  initDataTableActions() {
    let that = this;

    $(this.dataTable).DataTable().on("preXhr", function (e, d) {
      let dt = $(that.dataTable).DataTable();

      // If another request is active, abort in favor of current
      if (dt.settings()[0].jqXHR) {
        dt.settings()[0].jqXHR.abort();
      }

      let url = that.props.taxonQuery.rootApiUrl
          + "?taxonTypeCode=" + that.props.taxonQuery.taxonTypeCode
          + "&verbose=true"
          + "&offset=" + dt.page.info().start
          + "&limit=" + dt.page.info().length + "";

      if (that.props.taxonQuery.locationName) {
          url += "&locationName=" + that.props.taxonQuery.locationName;
      }

      d.ajax.url = url;
    });

    this.debounceSearch();

    $("div.toggle-columns").prepend(
      "<button id=\"showDisplayColumns\" class=\"btn btn-show-display-columns\" data-selenium=\"table-section.table-columns-button\">" +
        "<span>Table Columns</span>" +
        "<i class=\"fa fa-columns\"></i>" +
      "</button>"
    );

    $("#showDisplayColumns").on("click", function () {
      that.handleToggleColumnManagerVisibility();
    });

    $("div.toggle-columns").prepend(
      "<button id=\"btnResetFilters\" class=\"btn btn-reset-filters\" data-selenium=\"table-section.reset-filters-button\">" +
        "<span>Reset Filters</span>" +
        "<i class=\"fa fa-times\"></i>" +
      "</button>"
    );

    $("#btnResetFilters").on("click", function () {
      that.resetQueryFilter();
    });
  }

  handleToggleColumnManagerVisibility() {
    if (this.props.onToggleColumnManagerVisibility) {
      this.props.onToggleColumnManagerVisibility();
    }
  }

  getDataTableAjax() {
    let that = this;
    return {
      type: "POST",
      cache: "false",

      // The text/plain here prevents preflight request on POST
      contentType: "text/plain",

      headers: NeonApi.getApiTokenHeader(),

      xhrFields: {
        withCredentials: NeonEnvironment.requireCors(),
      },

      data: function () {
        that.updateTaxonQuery();
        return JSON.stringify(that.queryFilter);
      },
      error: function (jqXHR, statusText, error) {
        // Prevent table reset on aborted requests
        if (error === "abort") {
          return;
        }
        that.clearTableData();
      },
      dataFilter: function (data) {
        let jsonData = JSON.parse(data);
        let returnData = {
          recordsTotal: jsonData.total,
          recordsFiltered: jsonData.total,
          data: jsonData.data
        };

        return JSON.stringify(returnData);
      }
    };
  }

  updateData() {
    $(this.dataTable).DataTable().ajax.reload();
  }

  resetQueryFilter() {
    this.clearSearch();
    this.clearColumnOrders();
    this.clearFilters();

    this.updateData();
  }

  clearSearch() {
    $(this.dataTable).DataTable().search("");
  }

  clearColumnOrders() {
    $(this.dataTable).DataTable().order([0, "asc"]);
  }

  clearFilters() {
    let table = $(this.dataTable).DataTable();

    this.queryFilter.filterColumns = {};
    table.settings().init().columns.forEach((column, index) => {
      $(table.column(index).header()).find("input[type=\"filter\"]").each(function() {
        $(this).val(null);
      });
    });
  }

  clearTableData() {
    $(this.dataTable).dataTable()._fnAjaxUpdateDraw({
      recordsTotal: 0,
      recordsFiltered: 0,
      data: []
    });
    $("#" + this.dataTable.id + "_processing").css("display", "none");
    $(this.dataTable).find("td.dataTables_empty").attr("colspan", "100");
  }

  getColumnFilterInput(queryName, index) {
    let that = this;
    let table = $(this.dataTable).DataTable();

    let input = $(
      "<input type=\"filter\" " +
          "query-name=\"" + queryName + "\" " +
          "col-index=\"" + index.toString() + "\" " +
          "class=\"input-sm form-control\" " +
          "data-selenium=\"table-section.column-filter." + queryName + "\" />"
    );

    let method = _.debounce((e, table, queryName, term) => {
      that.debounceColumnFilterMethod(e, table, queryName, term);
    }, table.settings()[0].searchDelay);

    input.off("click").on("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
    });
    input.off("keyup cut paste").on("keyup cut paste", function (e) {
      e.preventDefault();
      e.stopPropagation();
      method(e, table, queryName, input.val());
    });
    input.off("cut paste").on("cut paste", function (e) {
      method(e, table, queryName, input.val());
    });

    return input;
  }

  prohibitColumnHeaderKeyEvents(header) {
    $(header).off("keydown keypress keyup");
  }

  findColumnByTitle(title) {
    let table = $(this.dataTable).DataTable();

    let col = null;
    table.settings().init().columns.forEach(function (column, index) {
      if (column.queryName && (title === column.title)) {
        col = {
          index: index,
          column: column
        };
        return false;
      }
    });

    return col;
  }

  toggleColumnVisibility(cols) {
    let that = this;
    let table = $(this.dataTable).DataTable();

    if (!cols || (Object.keys(cols).length <= 0)) {
      return;
    }

    let foundColumns = [];
    table.settings().init().columns.forEach(function (column, index) {
      if (cols[column.queryName]) {
        table.column(index).visible(!column.visible);
        column.visible = !column.visible;
        foundColumns.push({
          column: column,
          index: index
        });
      }
    });

    if (foundColumns.length > 0) {
      foundColumns.forEach((foundColumn) => {
        if (!foundColumn.column.visible) {
          delete this.queryFilter.filterColumns[foundColumn.column.queryName];
        }

        $(this.dataTable).find("thead th").each(function () {
          that.prohibitColumnHeaderKeyEvents(this);
          let col = that.findColumnByTitle(this.innerHTML);
          if (col) {
            if (this.innerHTML.toString().indexOf("<input") < 0) {
              $(this).append(that.getColumnFilterInput(foundColumn.column.queryName, foundColumn.index));
              return false;
            }
          }
        });
      });
    }
  }

  debounceSearchMethod(e, api, term) {
    let testTerm = null;
    if ((typeof term !== "undefined") && (term !== null) && (term.trim().length > 0)) {
      testTerm = term.trim();
    }

    if ((testTerm && (e.which === 13)) || (this.queryFilter.search.term !== testTerm)) {
      api.search(term);
      this.updateData();
    }
  }

  debounceSearch() {
    let table = $(this.dataTable);
    let filterContainer = $.find("div.dataTables_filter");
    let input = $(filterContainer).find("input[type=\"search\"]");
    let api = table.DataTable();

    let that = this;
    let method = _.debounce((e, api, term) => {
      that.debounceSearchMethod(e, api, term);
    }, api.settings()[0].searchDelay);

    input.off().on("keyup cut paste", function (e) {
      method(e, api, input.val());
    });
  }

  debounceColumnFilterMethod(e, api, queryName, term) {
    let testTerm = null;
    let update = false;

    if ((typeof term !== "undefined") && (term !== null) && (term.trim().length > 0)) {
      testTerm = term.trim();
    }

    if (!testTerm) {
      if (this.queryFilter.filterColumns[queryName]) {
        update = true;
      }
      delete this.queryFilter.filterColumns[queryName];
    } else if ((e.which === 13) || this.queryFilter.filterColumns[queryName] !== testTerm) {
      this.queryFilter.filterColumns[queryName] = testTerm;
      update = true;
    }

    if (update) {
      this.updateData();
    }
  }

  updateTaxonQuery() {
    let table = $(this.dataTable).DataTable();
    let searchTerm = table.search();
    let that = this;

    this.queryFilter.search.term = null;
    this.queryFilter.search.columns = [];
    if ((typeof searchTerm !== "undefined") && (searchTerm !== null) && (searchTerm.trim().length > 0)) {
      this.queryFilter.search.term = searchTerm.trim();
      table.settings().init().columns.forEach(function (col) {
        if (col.queryName) { // && col.visible) {
          that.queryFilter.search.columns.push(col.queryName);
        }
      });
    }

    let order = table.order();
    this.queryFilter.orderByColumns = {};
    order.forEach(function (value) {
      let queryName = table.settings().init().columns[value[0]].queryName;
      if (queryName) {
        that.queryFilter.orderByColumns[queryName] = value[1];
      }
    });
  }

  render() {
    let tableStyle = {
      width: "100%"
    }

    return (
      <div>
        <table ref={dataTable => this.dataTable = dataTable}
          style={tableStyle}
          className="table table-striped table-bordered">
        </table>
      </div>
    );
  }
}

export default DataTable;
