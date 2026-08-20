import React from 'react';
import { Table, Layers } from 'lucide-react';

interface HeaderProps {
  totalRows: number;
  totalColumns: number;
}

export const Header: React.FC<HeaderProps> = ({ totalRows, totalColumns }) => {
  return (
    <header className="h-14 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-4 flex items-center justify-between shrink-0 select-none z-30">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600 shadow-md shadow-indigo-900/40 text-white font-bold">
          <Table className="w-4 h-4" />
        </div>
        <div>
          <h1 className="text-sm font-semibold text-slate-100 flex items-center gap-1.5 leading-none">
            <span>JSON to Table</span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Virtualized
            </span>
          </h1>
          <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
            Interactive JSON Table with filtering, resizing, & JSONPath
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {totalRows > 0 && (
          <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-950/80 border border-slate-800 text-xs text-slate-300">
            <span className="flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <strong className="text-slate-100">{totalRows}</strong> rows
            </span>
            <span className="text-slate-600">|</span>
            <span className="flex items-center gap-1">
              <span className="text-slate-400">Cols:</span>
              <strong className="text-slate-100">{totalColumns}</strong>
            </span>
          </div>
        )}
      </div>
    </header>
  );
};
