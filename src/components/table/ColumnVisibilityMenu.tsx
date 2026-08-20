import React, { useState, useRef, useEffect } from 'react';
import type { Table as TableInstance, Column } from '@tanstack/react-table';
import { Columns, Search, Eye, EyeOff, RotateCcw } from 'lucide-react';
import type { TableRowData } from '../../types/table';

interface ColumnVisibilityMenuProps {
  table: TableInstance<TableRowData>;
}

export const ColumnVisibilityMenu: React.FC<ColumnVisibilityMenuProps> = ({ table }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  const allColumns = table.getAllLeafColumns();
  const visibleCount = allColumns.filter((col: Column<TableRowData, unknown>) => col.getIsVisible()).length;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const filteredColumns = allColumns.filter((col: Column<TableRowData, unknown>) =>
    col.id.toLowerCase().includes(search.toLowerCase())
  );

  const handleShowAll = () => {
    table.toggleAllColumnsVisible(true);
  };

  const handleHideAll = () => {
    table.toggleAllColumnsVisible(false);
  };

  const handleReset = () => {
    table.resetColumnVisibility();
  };

  return (
    <div className="relative inline-block" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-850 hover:bg-slate-800 border border-slate-750 text-slate-200 text-xs font-medium transition cursor-pointer"
        title="Toggle Column Visibility"
      >
        <Columns className="w-3.5 h-3.5 text-indigo-400" />
        <span>Columns</span>
        <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] text-slate-300 font-mono">
          {visibleCount}/{allColumns.length}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 p-3 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-xs font-semibold text-slate-200">
            <span>Column Visibility</span>
            <button
              onClick={handleReset}
              className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-normal transition cursor-pointer"
              title="Reset column visibility"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          </div>

          {/* Search box inside menu */}
          <div className="relative mb-2">
            <Search className="w-3 h-3 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter columns..."
              className="w-full bg-slate-950 border border-slate-800 rounded-md pl-7 pr-2 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-sans"
            />
          </div>

          {/* Quick toggle action buttons */}
          <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-800/80">
            <button
              onClick={handleShowAll}
              className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 transition cursor-pointer"
            >
              <Eye className="w-3 h-3 text-emerald-400" />
              Show All
            </button>
            <button
              onClick={handleHideAll}
              className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 transition cursor-pointer"
            >
              <EyeOff className="w-3 h-3 text-rose-400" />
              Hide All
            </button>
          </div>

          {/* Column toggles list */}
          <div className="max-h-56 overflow-y-auto space-y-1 pr-1">
            {filteredColumns.length === 0 ? (
              <div className="text-center py-3 text-xs text-slate-500">
                No matching columns
              </div>
            ) : (
              filteredColumns.map((column: Column<TableRowData, unknown>) => {
                const isVisible = column.getIsVisible();
                return (
                  <label
                    key={column.id}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-slate-800/80 cursor-pointer text-xs transition select-none"
                  >
                    <input
                      type="checkbox"
                      checked={isVisible}
                      onChange={column.getToggleVisibilityHandler()}
                      className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5 bg-slate-950 cursor-pointer"
                    />
                    <span className={`truncate font-mono ${isVisible ? 'text-slate-200' : 'text-slate-500 line-through'}`}>
                      {column.id}
                    </span>
                  </label>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
