import React from 'react';
import { Database, ChevronDown } from 'lucide-react';
import { SAMPLE_DATASETS } from '../../utils/sampleData';

interface SampleDataPickerProps {
  onSelectSample: (sampleId: string) => void;
}

export const SampleDataPicker: React.FC<SampleDataPickerProps> = ({ onSelectSample }) => {
  return (
    <div className="relative group">
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-xs font-medium cursor-pointer transition">
        <Database className="w-3.5 h-3.5 text-indigo-400" />
        <span>Load Sample Data</span>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:rotate-180 transition-transform" />
      </div>

      <div className="absolute right-0 top-full mt-1.5 w-64 p-1.5 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-40 hidden group-hover:block transition-all">
        <div className="px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800/80">
          Sample Datasets
        </div>
        <div className="mt-1 space-y-1">
          {SAMPLE_DATASETS.map((sample) => (
            <button
              key={sample.id}
              onClick={() => onSelectSample(sample.id)}
              className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-slate-800 transition cursor-pointer text-xs group/item"
            >
              <div className="font-medium text-slate-200 group-hover/item:text-indigo-300 flex items-center justify-between">
                <span>{sample.name}</span>
                {sample.path && (
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-800/90 px-1.5 py-0.5 rounded">
                    {sample.path}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                {sample.description}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
