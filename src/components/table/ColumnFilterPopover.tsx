import React, { useState, useRef, useEffect } from 'react';
import type { Column } from '@tanstack/react-table';
import { Filter, Check } from 'lucide-react';
import type { TableRowData } from '../../types/table';

interface ColumnFilterPopoverProps {
  column: Column<TableRowData, unknown>;
}

export const ColumnFilterPopover: React.FC<ColumnFilterPopoverProps> = ({ column }) => {
  const [isOpen, setIsOpen] = useState(false);
  const filterValue = (column.getFilterValue() as string) ?? '';
  const [inputValue, setInputValue] = useState(filterValue);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputValue((column.getFilterValue() as string) ?? '');
  }, [column]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleApply = (value: string) => {
    column.setFilterValue(value ? value : undefined);
    setIsOpen(false);
  };

  const handleClear = () => {
    setInputValue('');
    column.setFilterValue(undefined);
    setIsOpen(false);
  };

  const isFiltered = Boolean(filterValue);

  return (
    <div className="relative inline-block" ref={popoverRef}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={`p-1 rounded hover:bg-slate-700/80 transition cursor-pointer ${
          isFiltered ? 'text-indigo-400 bg-indigo-950/80' : 'text-slate-400 hover:text-slate-200'
        }`}
        title={isFiltered ? `Active Filter: "${filterValue}"` : `Filter ${column.id}`}
      >
        <Filter className="w-3.5 h-3.5" />
      </button>

      {isOpen && (
        <div
          className="absolute right-0 top-full mt-2 w-60 p-3 bg-slate-900 border border-slate-700/90 rounded-xl shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-100"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-xs font-semibold text-slate-200">
            <span>Filter "{column.id}"</span>
            {isFiltered && (
              <button
                onClick={handleClear}
                className="text-[11px] text-rose-400 hover:text-rose-300 font-normal transition cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          <div className="space-y-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleApply(inputValue);
                }
              }}
              placeholder={`Search in ${column.id}...`}
              autoFocus
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-sans"
            />

            <div className="flex items-center justify-end gap-1.5 pt-1">
              <button
                onClick={() => setIsOpen(false)}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleApply(inputValue)}
                className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition cursor-pointer flex items-center gap-1"
              >
                <Check className="w-3 h-3" />
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
