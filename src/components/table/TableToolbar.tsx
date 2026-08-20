import React, { useState } from 'react';
import type { Table as TableInstance, Column, Row } from '@tanstack/react-table';
import {
  Search,
  Download,
  FileSpreadsheet,
  FileCode,
  X,
  RotateCcw,
  ArrowLeftRight,
} from 'lucide-react';
import { ColumnVisibilityMenu } from './ColumnVisibilityMenu';
import { ColumnReorderModal } from './ColumnReorderModal';
import { convertToCSV, downloadFile } from '../../utils/tableHelper';
import type { TableRowData } from '../../types/table';

interface TableToolbarProps {
  table: TableInstance<TableRowData>;
  globalFilter: string;
  setGlobalFilter: (value: string) => void;
  totalRows: number;
  filteredRowsCount: number;
  columnOrder: string[];
  setColumnOrder: (order: string[]) => void;
  defaultColumnOrder: string[];
  rawRows?: any[];
}

export const TableToolbar: React.FC<TableToolbarProps> = ({
  table,
  globalFilter,
  setGlobalFilter,
  totalRows,
  filteredRowsCount,
  columnOrder,
  setColumnOrder,
  defaultColumnOrder,
}) => {
  const [showReorderModal, setShowReorderModal] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const columnFilters = table.getState().columnFilters;
  const activeFiltersCount = columnFilters.length + (globalFilter ? 1 : 0);

  const handleClearAllFilters = () => {
    table.resetColumnFilters();
    setGlobalFilter('');
  };

  const handleExportCSV = () => {
    const visibleCols = table.getVisibleLeafColumns().map((c: Column<TableRowData, unknown>) => c.id);
    const displayedData = table.getRowModel().rows.map((r: Row<TableRowData>) => r.original);
    const csv = convertToCSV(displayedData, visibleCols);
    downloadFile(csv, `table_export_${Date.now()}.csv`, 'text/csv;charset=utf-8;');
    setShowExportMenu(false);
  };

  const handleExportJSON = () => {
    const displayedData = table.getRowModel().rows.map((r: Row<TableRowData>) => r.original);
    const jsonStr = JSON.stringify(displayedData, null, 2);
    downloadFile(jsonStr, `table_export_${Date.now()}.json`, 'application/json');
    setShowExportMenu(false);
  };

  return (
    <div className="px-4 py-3 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0 backdrop-blur-md">
      {/* Left side: Item count & Active filter status */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-100">
            {filteredRowsCount === totalRows ? (
              <span>Total Items: <strong className="text-indigo-400 font-mono text-sm">{totalRows}</strong></span>
            ) : (
              <span>
                Showing <strong className="text-indigo-400 font-mono text-sm">{filteredRowsCount}</strong> of{' '}
                <strong className="text-slate-300 font-mono text-sm">{totalRows}</strong> items
              </span>
            )}
          </span>

          {activeFiltersCount > 0 && (
            <div className="flex items-center gap-1.5 pl-2 border-l border-slate-700">
              <span className="px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800 text-[11px] font-medium">
                {activeFiltersCount} {activeFiltersCount === 1 ? 'filter active' : 'filters active'}
              </span>
              <button
                onClick={handleClearAllFilters}
                className="text-[11px] text-slate-400 hover:text-rose-300 transition cursor-pointer flex items-center gap-0.5"
                title="Clear all column & global filters"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right side: Global search, Column Visibility, Reorder, Export */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Global Search Input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={globalFilter ?? ''}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Global search..."
            className="bg-slate-950 border border-slate-750 focus:border-indigo-500 rounded-lg pl-8 pr-7 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition w-44 md:w-56"
          />
          {globalFilter && (
            <button
              onClick={() => setGlobalFilter('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Column Visibility Selector */}
        <ColumnVisibilityMenu table={table} />

        {/* Reorder Columns Modal Trigger */}
        <button
          onClick={() => setShowReorderModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-850 hover:bg-slate-800 border border-slate-750 text-slate-200 text-xs font-medium transition cursor-pointer"
          title="Reorder Column Sequence"
        >
          <ArrowLeftRight className="w-3.5 h-3.5 text-indigo-400" />
          <span>Move Columns</span>
        </button>

        {/* Export Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition cursor-pointer shadow-md shadow-indigo-950/40"
            title="Export Table Data"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>

          {showExportMenu && (
            <div className="absolute right-0 top-full mt-1.5 w-40 p-1 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-40 animate-in fade-in duration-100">
              <button
                onClick={handleExportCSV}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 text-xs transition cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                <span>Export as CSV</span>
              </button>
              <button
                onClick={handleExportJSON}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 text-xs transition cursor-pointer"
              >
                <FileCode className="w-3.5 h-3.5 text-indigo-400" />
                <span>Export as JSON</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Column Reorder Modal */}
      <ColumnReorderModal
        isOpen={showReorderModal}
        onClose={() => setShowReorderModal(false)}
        columnOrder={columnOrder}
        setColumnOrder={setColumnOrder}
        defaultColumnOrder={defaultColumnOrder}
      />
    </div>
  );
};
