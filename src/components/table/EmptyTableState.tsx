import React from 'react';
import { TableProperties, AlertCircle, FilePlus2, FilterX } from 'lucide-react';

interface EmptyTableStateProps {
  type: 'no-data' | 'filtered-out' | 'error';
  errorMessage?: string;
  onResetFilters?: () => void;
  onLoadSample?: () => void;
}

export const EmptyTableState: React.FC<EmptyTableStateProps> = ({
  type,
  errorMessage,
  onResetFilters,
  onLoadSample,
}) => {
  if (type === 'filtered-out') {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-slate-950/40">
        <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl mb-4 text-slate-400">
          <FilterX className="w-8 h-8 text-amber-400" />
        </div>
        <h3 className="text-base font-semibold text-slate-200 mb-1">No Matching Records Found</h3>
        <p className="text-xs text-slate-400 max-w-sm mb-4">
          Your current column filters or search term filtered out all rows.
        </p>
        {onResetFilters && (
          <button
            onClick={onResetFilters}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition cursor-pointer shadow-md shadow-indigo-950/50"
          >
            Clear All Active Filters
          </button>
        )}
      </div>
    );
  }

  if (type === 'error') {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-slate-950/40">
        <div className="p-4 bg-rose-950/40 border border-rose-800/60 rounded-2xl mb-4 text-rose-400">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h3 className="text-base font-semibold text-rose-200 mb-1">Cannot Display Table</h3>
        <p className="text-xs text-rose-300/80 max-w-md mb-4">
          {errorMessage || 'Please resolve the JSON syntax or fetching error in the input panel.'}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-slate-950/40 select-none">
      <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl mb-4 text-slate-400">
        <TableProperties className="w-10 h-10 text-indigo-400" />
      </div>
      <h3 className="text-lg font-semibold text-slate-200 mb-1">No JSON Data Loaded</h3>
      <p className="text-xs text-slate-400 max-w-md mb-5 leading-relaxed">
        Paste a JSON array or object in the left panel, or fetch a remote API URL. You can also click below to load a sample dataset instantly.
      </p>
      {onLoadSample && (
        <button
          onClick={onLoadSample}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-medium transition cursor-pointer shadow-lg shadow-indigo-950/60"
        >
          <FilePlus2 className="w-4 h-4" />
          <span>Load E-Commerce Sample Data</span>
        </button>
      )}
    </div>
  );
};
