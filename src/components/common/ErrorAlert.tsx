import React from 'react';
import { AlertCircle, FileCode, Globe, HelpCircle, XCircle } from 'lucide-react';
import type { ParseError } from '../../types/table';

interface ErrorAlertProps {
  error: ParseError | null;
  onDismiss?: () => void;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({ error, onDismiss }) => {
  if (!error) return null;

  const getIcon = () => {
    switch (error.type) {
      case 'syntax':
        return <FileCode className="w-5 h-5 text-amber-400 shrink-0" />;
      case 'fetch':
        return <Globe className="w-5 h-5 text-rose-400 shrink-0" />;
      case 'jsonpath':
        return <HelpCircle className="w-5 h-5 text-cyan-400 shrink-0" />;
      default:
        return <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />;
    }
  };

  const getBadgeTitle = () => {
    switch (error.type) {
      case 'syntax':
        return 'JSON Syntax Error';
      case 'fetch':
        return 'Data Fetch Error';
      case 'jsonpath':
        return 'JSONPath Resolution Error';
      case 'validation':
        return 'Input Validation';
      default:
        return 'Error';
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-700/80 rounded-xl p-4 shadow-xl backdrop-blur-md transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          {getIcon()}
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                {getBadgeTitle()}
              </span>
              {error.line !== undefined && (
                <span className="text-xs text-amber-300/90 font-mono">
                  Line {error.line}:{error.column}
                </span>
              )}
            </div>

            <p className="text-sm font-medium text-slate-100 mt-1.5 leading-relaxed">
              {error.message}
            </p>

            {error.details && (
              <pre className="mt-2.5 p-2.5 bg-slate-950/90 border border-slate-800 rounded-lg text-xs font-mono text-amber-300/80 overflow-x-auto whitespace-pre-wrap">
                {error.details}
              </pre>
            )}

            {error.type === 'fetch' && (
              <p className="text-xs text-slate-400 mt-2">
                Tip: If this is a cross-origin error, test with a public API that enables CORS like{' '}
                <code className="text-indigo-300">https://dummyjson.com/products</code> or{' '}
                <code className="text-indigo-300">https://jsonplaceholder.typicode.com/posts</code>.
              </p>
            )}
          </div>
        </div>

        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-slate-400 hover:text-slate-200 transition p-1 rounded-md hover:bg-slate-800 cursor-pointer"
            title="Dismiss error"
          >
            <XCircle className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
