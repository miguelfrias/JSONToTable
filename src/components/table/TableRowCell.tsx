import React, { useState } from 'react';
import { ExternalLink, Check, X, Layers, Braces } from 'lucide-react';
import { Modal } from '../common/Modal';

interface TableRowCellProps {
  value: any;
  columnId: string;
}

export const TableRowCell: React.FC<TableRowCellProps> = ({ value, columnId }) => {
  const [showJsonModal, setShowJsonModal] = useState(false);

  // Null / Undefined
  if (value === null || value === undefined) {
    return <span className="text-slate-600 italic text-xs">null</span>;
  }

  // Boolean
  if (typeof value === 'boolean') {
    return value ? (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/50 text-[11px] font-medium">
        <Check className="w-3 h-3" /> true
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-rose-950/60 text-rose-300 border border-rose-800/50 text-[11px] font-medium">
        <X className="w-3 h-3" /> false
      </span>
    );
  }

  // Number
  if (typeof value === 'number') {
    return (
      <span className="font-mono text-cyan-300 text-xs">
        {Number.isInteger(value) ? value : value.toLocaleString(undefined, { maximumFractionDigits: 4 })}
      </span>
    );
  }

  // Array
  if (Array.isArray(value)) {
    const isPrimitiveArray = value.every((v) => typeof v !== 'object');
    if (isPrimitiveArray && value.length <= 4) {
      return (
        <div className="flex items-center gap-1 flex-wrap overflow-hidden">
          {value.map((v, i) => (
            <span
              key={i}
              className="px-1.5 py-0.2 rounded bg-slate-800 border border-slate-700 text-slate-300 text-[11px] font-mono"
            >
              {String(v)}
            </span>
          ))}
        </div>
      );
    }

    return (
      <>
        <button
          onClick={() => setShowJsonModal(true)}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-950/60 hover:bg-indigo-900/80 border border-indigo-800/60 text-indigo-300 text-[11px] font-medium transition cursor-pointer"
        >
          <Layers className="w-3 h-3" />
          <span>Array ({value.length})</span>
        </button>

        <Modal
          isOpen={showJsonModal}
          onClose={() => setShowJsonModal(false)}
          title={`Array Details: ${columnId}`}
        >
          <pre className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-200 overflow-x-auto max-h-96">
            {JSON.stringify(value, null, 2)}
          </pre>
        </Modal>
      </>
    );
  }

  // Object
  if (typeof value === 'object') {
    const keysCount = Object.keys(value).length;
    return (
      <>
        <button
          onClick={() => setShowJsonModal(true)}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-purple-950/60 hover:bg-purple-900/80 border border-purple-800/60 text-purple-300 text-[11px] font-medium transition cursor-pointer"
        >
          <Braces className="w-3 h-3" />
          <span>Object ({keysCount} keys)</span>
        </button>

        <Modal
          isOpen={showJsonModal}
          onClose={() => setShowJsonModal(false)}
          title={`Object Details: ${columnId}`}
        >
          <pre className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-200 overflow-x-auto max-h-96">
            {JSON.stringify(value, null, 2)}
          </pre>
        </Modal>
      </>
    );
  }

  // URL / Image strings
  const stringVal = String(value);
  if (/^https?:\/\//i.test(stringVal)) {
    return (
      <a
        href={stringVal}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 underline underline-offset-2 truncate max-w-full text-xs"
      >
        <span className="truncate">{stringVal}</span>
        <ExternalLink className="w-3 h-3 shrink-0" />
      </a>
    );
  }

  // Regular string
  return (
    <span className="text-slate-200 text-xs truncate max-w-full block" title={stringVal}>
      {stringVal}
    </span>
  );
};
