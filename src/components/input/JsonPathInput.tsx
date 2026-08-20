import React from 'react';
import { Route, Sparkles, X } from 'lucide-react';

interface JsonPathInputProps {
  value: string;
  onChange: (path: string) => void;
  suggestedPaths?: string[];
  error?: string | null;
}

export const JsonPathInput: React.FC<JsonPathInputProps> = ({
  value,
  onChange,
  suggestedPaths = [],
  error,
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
          <Route className="w-3.5 h-3.5 text-indigo-400" />
          <span>JSONPath Target Path</span>
          <span className="text-[11px] text-slate-400 font-normal">(e.g. <code className="text-indigo-300">$.products</code> or <code className="text-indigo-300">$</code>)</span>
        </label>

        {value && value !== '$' && (
          <button
            onClick={() => onChange('$')}
            className="text-[11px] text-indigo-400 hover:text-indigo-300 transition cursor-pointer flex items-center gap-1"
          >
            Reset to Root ($)
          </button>
        )}
      </div>

      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="e.g. $.products or $.data.items"
          className={`w-full bg-slate-900/90 border rounded-lg px-3 py-2 text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 transition ${
            error
              ? 'border-rose-500/80 focus:ring-rose-500/30'
              : 'border-slate-700/80 focus:border-indigo-500/80 focus:ring-indigo-500/20'
          }`}
        />

        {value && (
          <button
            onClick={() => onChange('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition p-0.5 cursor-pointer"
            title="Clear path"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {suggestedPaths.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            Detected arrays:
          </span>
          {suggestedPaths.map((path) => (
            <button
              key={path}
              onClick={() => onChange(path)}
              className={`text-[11px] font-mono px-2 py-0.5 rounded-md border transition cursor-pointer ${
                value === path
                  ? 'bg-indigo-600/30 border-indigo-500/60 text-indigo-300 font-semibold'
                  : 'bg-slate-850 border-slate-750 text-slate-300 hover:border-slate-600 hover:text-slate-100'
              }`}
            >
              {path}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
