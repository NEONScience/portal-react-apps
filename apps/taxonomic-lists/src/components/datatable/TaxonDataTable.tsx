import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type KeyboardEvent,
  type ComponentRef,
} from 'react';

import debounce from 'lodash/debounce';

import Button from '@mui/material/Button';
import FilterListIcon from '@mui/icons-material/FilterList';

import DataTablesReact from 'datatables.net-react';
import DataTablesBootstrap5, { ApiColumnMethods } from 'datatables.net-bs5';

import 'datatables.net-responsive-bs5';

import NeonApi from 'portal-core-components/lib/components/NeonApi';
import { isStringNonEmpty } from 'portal-core-components/lib/util/typeUtil';

const SEARCH_DELAY_MS = 400;

interface TaxonDataTableColumn {
  queryName: string;
  title: string;
  visible: boolean;
}

interface TaxonQuery {
  locationName?: string;
  rootApiUrl: string;
  taxonTypeCode: string;
}

interface QueryFilterSearchValue {
  value: string;
}
interface QueryFilterColumn {
  search: QueryFilterSearchValue;
}
interface QueryFilterColumnOrder {
  column: string;
  dir: 'asc' | 'desc';
}
interface DataTablesRequest {
  start: number;
  length: number;
  draw: number;
}
interface TaxonQueryRequest extends DataTablesRequest {
  columns: QueryFilterColumn[];
  search: QueryFilterSearchValue;
  order: QueryFilterColumnOrder[];
}

interface TaxonApiQueryFilterSearch {
  term: string | null;
  columns: string[];
}
interface TaxonApiQueryFilter {
  search: TaxonApiQueryFilterSearch;
  orderByColumns: Record<string, 'asc' | 'desc'>;
  filterColumns: Record<string, string>;
}

interface TaxonApiResponse {
  data?: unknown[];
  total?: number | string;
}

interface DataTablesResponse {
  data: unknown[];
  draw: number;
  recordsFiltered: number;
  recordsTotal: number;
}

const DATA_TABLE_OPTIONS = {
  serverSide: true,
  processing: true,
  responsive: true,
  ordering: true,
  searching: true,
  searchDelay: SEARCH_DELAY_MS,
  order: [[0, 'asc']],
  pageLength: 100,
  lengthMenu: [10, 50, 100],
  titleRow: 0,
  layout: {
    top2Start: 'pageLength',
    top2End: 'search',
    topStart: 'info',
    topEnd: 'paging',
    bottomStart: 'info',
    bottomEnd: 'paging',
  },
  language: {
    search: 'Keyword Search:',
    emptyTable: 'No data available',
    processing: `
      <span class="spinner-border text-primary" role="status">
        <span class="visually-hidden">
          Loading…
        </span>
      </span>
    `,
  },
};

const normalizeSearchTerm = (value: unknown): string|null => (
  isStringNonEmpty(value) ? (value as string).trim() : null
);

const creatTaxonQueryFilter = (
  request: TaxonQueryRequest,
  columns: TaxonDataTableColumn[],
): TaxonApiQueryFilter => {
  const globalSearchTerm = normalizeSearchTerm(request.search.value);
  const filterColumns: Record<string, string> = {};
  const orderByColumns: Record<string, 'asc' | 'desc'> = {};
  request.columns.forEach((requestColumn: QueryFilterColumn, index: number): void => {
    const queryName = columns[index]?.queryName;
    const filterTerm = normalizeSearchTerm(requestColumn.search.value);
    if (isStringNonEmpty(queryName) && isStringNonEmpty(filterTerm)) {
      filterColumns[queryName] = filterTerm as string;
    }
  });
  request.order.forEach((order: QueryFilterColumnOrder): void => {
    const queryName = columns[Number(order.column)]?.queryName;
    if (isStringNonEmpty(queryName)) {
      orderByColumns[queryName] = order.dir;
    }
  });
  let searchColumns: string[] = [];
  if (isStringNonEmpty(globalSearchTerm)) {
    searchColumns = columns.map((column: TaxonDataTableColumn): string => column.queryName);
  }
  return {
    search: {
      term: globalSearchTerm,
      columns: searchColumns,
    },
    filterColumns,
    orderByColumns,
  };
};

interface ColumnFilterInputProps {
  columnIndex: number;
  onFilterChange: (columnIndex: number, value: string) => void;
  queryName: string;
  title: string;
}

const ColumnFilterInput: React.FC<ColumnFilterInputProps> = (
  props: ColumnFilterInputProps,
): React.JSX.Element => {
  const {
    columnIndex,
    queryName,
    title,
    onFilterChange,
  }: ColumnFilterInputProps = props;
  const debouncedFilterChange = useMemo(
    () => debounce(
      (value: string) => onFilterChange(columnIndex, value),
      SEARCH_DELAY_MS,
    ),
    [columnIndex, onFilterChange],
  );
  useEffect(() => (
    () => debouncedFilterChange.cancel()
  ), [debouncedFilterChange]);

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    event.stopPropagation();
    if (event.key !== 'Enter') {
      return;
    }
    event.preventDefault();
    debouncedFilterChange.cancel();
    onFilterChange(columnIndex, event.currentTarget.value);
  };
  return (
    <div className="column-filter-input">
      <FilterListIcon
        className="column-filter-input-icon"
        fontSize="small"
        aria-hidden="true"
      />
      <input
        type="search"
        className="form-control form-control-sm"
        aria-label={`Filter ${title}`}
        autoComplete="off"
        data-selenium={`table-section.column-filter.${queryName}`}
        onClick={(event) => event.stopPropagation()}
        onKeyDown={handleKeyDown}
        onChange={(event) => debouncedFilterChange(event.currentTarget.value)}
      />
    </div>
  );
};

interface TaxonDataTableProps {
  columns: TaxonDataTableColumn[];
  onToggleColumnManagerVisibility?: () => void;
  taxonQuery: TaxonQuery;
}

const TaxonDataTable: React.FC<TaxonDataTableProps> = (
  props: TaxonDataTableProps,
): React.JSX.Element => {
  const {
    columns: columnsProp,
    taxonQuery,
    onToggleColumnManagerVisibility,
  }: TaxonDataTableProps = props;
  DataTablesReact.use(DataTablesBootstrap5);
  const tableRef = useRef<ComponentRef<typeof DataTablesReact>>(null);
  // Keep track of the current taxon type code to detect changes
  const { taxonTypeCode } = taxonQuery;
  const previousTaxonQueryKeyRef = useRef<string>(taxonTypeCode);
  const columns: TaxonDataTableColumn[] = useMemo(
    () => columnsProp,
    [columnsProp],
  );

  const ajax = useCallback(async (
    request: TaxonQueryRequest,
    callback: (response: DataTablesResponse) => void,
  ): Promise<void> => {
    const appliedTaxonTypeCode = previousTaxonQueryKeyRef.current;
    const taxonTypeCodeQuery = `taxonTypeCode=${appliedTaxonTypeCode}`;
    const verboseQuery = 'verbose=true';
    const pageQuery = `offset=${request.start || 0}&limit=${request.length || 100}`;
    const url = `${taxonQuery.rootApiUrl}?${taxonTypeCodeQuery}&${verboseQuery}&${pageQuery}`;
    const headers = {
      ...NeonApi.getApiTokenHeader() as Record<string, string>,
    };
    const requestInit = {
      method: 'POST',
      headers,
      body: JSON.stringify(creatTaxonQueryFilter(request, columns)),
    };
    try {
      const response = await fetch(url, requestInit);
      if (!response.ok) {
        throw new Error('Failed to fetch taxon data');
      }
      const jsonData: TaxonApiResponse = await response.json() as TaxonApiResponse;
      callback({
        draw: request.draw,
        recordsTotal: jsonData.total as number,
        recordsFiltered: jsonData.total as number,
        data: jsonData.data as Array<unknown>,
      });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      callback({
        draw: request.draw,
        recordsTotal: 0,
        recordsFiltered: 0,
        data: [],
      });
    }
  }, [columns, taxonQuery, previousTaxonQueryKeyRef]);

  const applyColumnFilter = useCallback((cbColumnIndex: number, cbValue: string): void => {
    const api = tableRef.current && tableRef.current.dt();
    if (!api) {
      return;
    }
    const column: ApiColumnMethods = api.column(cbColumnIndex);
    const searchTerm: string|null = normalizeSearchTerm(cbValue);
    if (column.search() !== searchTerm) {
      column.search(searchTerm || '').draw();
    }
  }, []);

  useEffect(() => {
    const api = tableRef.current && tableRef.current.dt();
    if (!api) {
      return;
    }
    let visibilityChanged = false;
    let searchChanged = false;
    // Update data table column visibility state based on current columns state
    columns.forEach((column: TaxonDataTableColumn, index: number): void => {
      const dataTableColumn: ApiColumnMethods = api.column(index);
      const visible = column.visible !== false;
      if (!visible) {
        const filterInput = dataTableColumn
          .header(1)
          .querySelector<HTMLInputElement>('input[type="search"]');
        if (filterInput) {
          filterInput.value = '';
        }
        if (dataTableColumn.search()) {
          dataTableColumn.search('');
          searchChanged = true;
        }
      }
      if (dataTableColumn.visible() !== visible) {
        dataTableColumn.visible(visible, false);
        visibilityChanged = true;
      }
    });
    // Update the data table when changes occur
    if (visibilityChanged) {
      api.columns.adjust();
      api.responsive.recalc();
    }
    if (searchChanged) {
      api.draw(false);
    }
  }, [columns]);

  // Handle triggering a new query when the taxon type code changes
  useEffect(() => {
    if (previousTaxonQueryKeyRef.current === taxonTypeCode) {
      return;
    }
    previousTaxonQueryKeyRef.current = taxonTypeCode;
    const api = tableRef.current && tableRef.current.dt();
    api?.ajax.reload(() => {}, true);
  }, [previousTaxonQueryKeyRef, taxonTypeCode]);

  const handleResetFilters = (): void => {
    const api = tableRef.current && tableRef.current.dt();
    if (!api) {
      return;
    }
    // Reset datatables state
    api.search('');
    api.columns().search('');
    columns.forEach((_, index) => {
      api.column(index).search('');
    });
    api.order([[0, 'asc']]);
    // Clear filter states
    const inputs = api.table().container().querySelectorAll<HTMLInputElement>(
      'input[type="search"]',
    );
    inputs.forEach((input) => {
      // eslint-disable-next-line no-param-reassign
      input.value = '';
    });
    api.draw();
  };

  const renderColumnHeaders = (): React.JSX.Element => ((
    <tr>
      {columns.map((column: TaxonDataTableColumn): React.JSX.Element => (
        <th key={column.queryName} scope="col">
          {column.title}
        </th>
      ))}
    </tr>
  ));
  const renderColumnHeaderFilters = (): React.JSX.Element => ((
    <tr className="header-filter-row" data-dt-order="disable">
      {columns.map((column: TaxonDataTableColumn, index: number): React.JSX.Element => (
        <th key={column.queryName} data-dt-order="disable">
          <ColumnFilterInput
            columnIndex={index}
            queryName={column.queryName}
            title={column.title}
            onFilterChange={applyColumnFilter}
          />
        </th>
      ))}
    </tr>
  ));

  return (
    <div>
      <div className="table-actions">
        <Button
          color="primary"
          variant="outlined"
          onClick={handleResetFilters}
          data-selenium="table-section.reset-filters-button"
        >
          Reset Filters
        </Button>
        <Button
          color="primary"
          variant="contained"
          onClick={onToggleColumnManagerVisibility}
          data-selenium="table-section.table-columns-button"
        >
          Table Columns
        </Button>
      </div>
      <DataTablesReact
        ref={tableRef}
        ajax={ajax}
        columns={columns}
        options={DATA_TABLE_OPTIONS}
        className="table table-striped table-bordered align-middle w-100"
      >
        <thead>
          {renderColumnHeaders()}
          {renderColumnHeaderFilters()}
        </thead>
        <tbody />
      </DataTablesReact>
    </div>
  );
};

export default TaxonDataTable;
