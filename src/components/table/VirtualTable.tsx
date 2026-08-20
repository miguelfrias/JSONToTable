import React, { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  type SortingState,
  type ColumnFiltersState,
  type VisibilityState,
  type ColumnSizingState,
  type ColumnDef,
  flexRender,
  type HeaderGroup,
  type Header,
  type Cell,
  type Column,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { TableRowData, TableSnapshot } from '../../types/table';
import { extractUniqueColumnKeys } from '../../utils/tableHelper';
import { TableHeaderCell } from './TableHeaderCell';
import { TableRowCell } from './TableRowCell';
import { TableToolbar } from './TableToolbar';
import { EmptyTableState } from './EmptyTableState';
import { ErrorBoundary } from '../common/ErrorBoundary';

interface VirtualTableProps {
  data: TableRowData[];
  onLoadSample?: () => void;
  globalFilter?: string;
  setGlobalFilter?: (value: string) => void;
  snapshot?: TableSnapshot | null;
  onSaveSnapshot?: () => void;
}

export const VirtualTable: React.FC<VirtualTableProps> = ({
  data,
  onLoadSample,
  globalFilter: controlledGlobalFilter,
  setGlobalFilter: controlledSetGlobalFilter,
  snapshot,
  onSaveSnapshot,
}) => {
  // Extract unique column keys
  const uniqueKeys = useMemo(() => extractUniqueColumnKeys(data), [data]);

  // Table states
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [internalGlobalFilter, setInternalGlobalFilter] = useState('');
  const globalFilter = controlledGlobalFilter !== undefined ? controlledGlobalFilter : internalGlobalFilter;
  const setGlobalFilter = controlledSetGlobalFilter || setInternalGlobalFilter;

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnOrder, setColumnOrder] = useState<string[]>([]);
  const [columnSizing, setColumnSizing] = useState<ColumnSizingState>({});
  const [draggedColId, setDraggedColId] = useState<string | null>(null);

  // Generate dynamic column definitions
  const { columns, defaultColumnOrder } = useMemo(() => {
    if (!data || data.length === 0) {
      return { columns: [], defaultColumnOrder: [] };
    }

    const cols: ColumnDef<TableRowData, any>[] = uniqueKeys.map(({ key }) => ({
      id: key,
      accessorKey: key,
      header: key,
      size: 180,
      minSize: 80,
      maxSize: 600,
      cell: (info) => <TableRowCell value={info.getValue()} columnId={key} />,
      filterFn: (row: any, columnId: string, filterValue: string) => {
        const value = row.getValue(columnId);
        if (value === null || value === undefined) return false;
        const stringified = typeof value === 'object' ? JSON.stringify(value) : String(value);
        return stringified.toLowerCase().includes(String(filterValue).toLowerCase());
      },
    }));

    const defaultOrder = cols.map((c) => c.id as string);
    return { columns: cols, defaultColumnOrder: defaultOrder };
  }, [data, uniqueKeys]);

  // Sync snapshot configuration when active snapshot changes
  useEffect(() => {
    if (snapshot) {
      if (snapshot.columnOrder && snapshot.columnOrder.length > 0) {
        setColumnOrder(snapshot.columnOrder);
      }
      if (snapshot.columnVisibility) {
        setColumnVisibility(snapshot.columnVisibility);
      }
      if (snapshot.columnSizing) {
        setColumnSizing(snapshot.columnSizing);
      }
      if (snapshot.sorting) {
        setSorting(snapshot.sorting);
      }
      if (snapshot.columnFilters) {
        setColumnFilters(snapshot.columnFilters);
      }
    } else if (defaultColumnOrder.length > 0) {
      setColumnOrder(defaultColumnOrder);
    }
  }, [snapshot, defaultColumnOrder]);

  // TanStack Table Instance
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      columnVisibility,
      columnOrder,
      columnSizing,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnOrderChange: setColumnOrder,
    onColumnSizingChange: setColumnSizing,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    columnResizeMode: 'onChange',
    enableColumnResizing: true,
    defaultColumn: {
      size: 180,
      minSize: 80,
      maxSize: 600,
    },
  });

  // Reordering helpers
  const handleMoveColumn = useCallback(
    (colId: string, direction: 'left' | 'right') => {
      const currentOrder = table.getState().columnOrder.length > 0
        ? [...table.getState().columnOrder]
        : [...defaultColumnOrder];

      const currentIndex = currentOrder.indexOf(colId);
      if (currentIndex === -1) return;

      const targetIndex = direction === 'left' ? currentIndex - 1 : currentIndex + 1;
      if (targetIndex < 0 || targetIndex >= currentOrder.length) return;

      const temp = currentOrder[currentIndex];
      currentOrder[currentIndex] = currentOrder[targetIndex];
      currentOrder[targetIndex] = temp;

      setColumnOrder(currentOrder);
    },
    [table, defaultColumnOrder]
  );

  const handleDragStartColumn = useCallback((e: React.DragEvent, colId: string) => {
    setDraggedColId(colId);
    e.dataTransfer.setData('text/plain', colId);
  }, []);

  const handleDropColumn = useCallback(
    (e: React.DragEvent, targetColId: string) => {
      e.preventDefault();
      const sourceColId = draggedColId || e.dataTransfer.getData('text/plain');
      if (!sourceColId || sourceColId === targetColId) return;

      const currentOrder = table.getState().columnOrder.length > 0
        ? [...table.getState().columnOrder]
        : [...defaultColumnOrder];

      const sourceIdx = currentOrder.indexOf(sourceColId);
      const targetIdx = currentOrder.indexOf(targetColId);

      if (sourceIdx !== -1 && targetIdx !== -1) {
        currentOrder.splice(sourceIdx, 1);
        currentOrder.splice(targetIdx, 0, sourceColId);
        setColumnOrder(currentOrder);
      }
      setDraggedColId(null);
    },
    [draggedColId, table, defaultColumnOrder]
  );

  // Virtualization setup
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const { rows } = table.getRowModel();

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 40,
    overscan: 25,
  });

  // If no data loaded, show empty state
  if (!data || data.length === 0) {
    return <EmptyTableState type="no-data" onLoadSample={onLoadSample} />;
  }

  const visibleLeafColumns = table.getVisibleLeafColumns();
  const totalTableWidth = visibleLeafColumns.reduce(
    (sum: number, col: Column<TableRowData, unknown>) => sum + col.getSize(),
    0
  );

  return (
    <ErrorBoundary fallbackTitle="Table Rendering Error">
      <div className="flex flex-col h-full bg-slate-950 min-w-0 overflow-hidden">
        {/* Table top toolbar */}
        <TableToolbar
          table={table}
          globalFilter={globalFilter}
          setGlobalFilter={setGlobalFilter}
          totalRows={data.length}
          filteredRowsCount={rows.length}
          columnOrder={columnOrder}
          setColumnOrder={setColumnOrder}
          defaultColumnOrder={defaultColumnOrder}
          rawRows={data}
          onSaveState={onSaveSnapshot}
        />

        {/* If rows exist but filtered down to 0 */}
        {rows.length === 0 ? (
          <EmptyTableState
            type="filtered-out"
            onResetFilters={() => {
              table.resetColumnFilters();
              setGlobalFilter('');
            }}
          />
        ) : (
          /* Virtualized table container */
          <div
            ref={tableContainerRef}
            className="flex-1 overflow-auto bg-slate-950 relative"
          >
            <div
              style={{
                width: Math.max(totalTableWidth, 100),
                minWidth: '100%',
              }}
            >
              {/* Sticky Header */}
              <div className="sticky top-0 z-20 shadow-md">
                {table.getHeaderGroups().map((headerGroup: HeaderGroup<TableRowData>) => (
                  <div key={headerGroup.id} className="flex">
                    {headerGroup.headers.map((header: Header<TableRowData, unknown>, idx: number) => (
                      <TableHeaderCell
                        key={header.id}
                        header={header}
                        canMoveLeft={idx > 0}
                        canMoveRight={idx < headerGroup.headers.length - 1}
                        onMoveColumn={handleMoveColumn}
                        onDragStartColumn={handleDragStartColumn}
                        onDropColumn={handleDropColumn}
                      />
                    ))}
                  </div>
                ))}
              </div>

              {/* Virtualized Rows Container */}
              <div
                style={{
                  height: `${rowVirtualizer.getTotalSize()}px`,
                  position: 'relative',
                  width: '100%',
                }}
              >
                {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                  const row = rows[virtualRow.index];
                  return (
                    <div
                      key={row.id}
                      data-index={virtualRow.index}
                      ref={rowVirtualizer.measureElement}
                      className={`flex absolute top-0 left-0 w-full border-b border-slate-900 hover:bg-slate-900/60 transition-colors ${
                        virtualRow.index % 2 === 0 ? 'bg-slate-950' : 'bg-slate-925/40'
                      }`}
                      style={{
                        transform: `translateY(${virtualRow.start}px)`,
                      }}
                    >
                      {row.getVisibleCells().map((cell: Cell<TableRowData, unknown>) => {
                        const colWidth = cell.column.getSize();
                        return (
                          <div
                            key={cell.id}
                            className="flex items-center px-3 py-2 text-xs border-r border-slate-900/80 overflow-hidden"
                            style={{
                              width: colWidth,
                              maxWidth: Math.max(colWidth, 300),
                              minWidth: 80,
                            }}
                          >
                            <div className="w-full truncate">
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};
