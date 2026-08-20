import React, { useState } from 'react';
import {
  FileText,
  Globe,
  AlignLeft,
  Minimize2,
  Trash2,
  CheckCircle2,
  Copy,
  Check,
} from 'lucide-react';
import type { InputSourceType } from '../../types/table';
import { UrlFetcher } from './UrlFetcher';
import { JsonPathInput } from './JsonPathInput';
import { SampleDataPicker } from './SampleDataPicker';
import { formatJsonString, minifyJsonString } from '../../utils/jsonHelper';

interface JsonInputPanelProps {
  sourceType: InputSourceType;
  setSourceType: (type: InputSourceType) => void;
  rawJson: string;
  setRawJson: (json: string) => void;
  url: string;
  setUrl: (url: string) => void;
  onFetchUrl: (url: string) => void;
  isFetching: boolean;
  jsonPath: string;
  setJsonPath: (path: string) => void;
  suggestedPaths: string[];
  pathError?: string | null;
  onLoadSample: (sampleId: string) => void;
  onClear: () => void;
  hasValidData: boolean;
}

export const JsonInputPanel: React.FC<JsonInputPanelProps> = ({
  sourceType,
  setSourceType,
  rawJson,
  setRawJson,
  url,
  setUrl,
  onFetchUrl,
  isFetching,
  jsonPath,
  setJsonPath,
  suggestedPaths,
  pathError,
  onLoadSample,
  onClear,
  hasValidData,
}) => {
  const [copied, setCopied] = useState(false);

  const handleFormat = () => {
    const { formatted, error } = formatJsonString(rawJson);
    if (!error) {
      setRawJson(formatted);
    }
  };

  const handleMinify = () => {
    const { minified, error } = minifyJsonString(rawJson);
    if (!error) {
      setRawJson(minified);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(rawJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lineCount = rawJson ? rawJson.split('\n').length : 0;
  const byteSize = new Blob([rawJson]).size;
  const formattedSize = byteSize > 1024 ? `${(byteSize / 1024).toFixed(1)} KB` : `${byteSize} B`;

  return (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800 text-slate-200">
      {/* Panel Header */}
      <div className="p-3.5 border-b border-slate-800 flex items-center justify-between gap-2 shrink-0 bg-slate-900/60 backdrop-blur-md">
        <div className="flex items-center gap-1 p-0.5 bg-slate-950/80 border border-slate-800 rounded-lg">
          <button
            onClick={() => setSourceType('raw')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition cursor-pointer ${
              sourceType === 'raw'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Raw JSON</span>
          </button>
          <button
            onClick={() => setSourceType('url')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition cursor-pointer ${
              sourceType === 'url'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Fetch URL</span>
          </button>
        </div>

        <SampleDataPicker onSelectSample={onLoadSample} />
      </div>

      {/* Panel Body */}
      <div className="flex-1 flex flex-col p-4 space-y-4 overflow-y-auto min-h-0">
        {sourceType === 'url' ? (
          <div className="p-3.5 bg-slate-950/60 border border-slate-800/80 rounded-xl space-y-3">
            <UrlFetcher
              url={url}
              setUrl={setUrl}
              onFetch={onFetchUrl}
              isLoading={isFetching}
            />
          </div>
        ) : (
          <div className="flex-1 flex flex-col min-h-[220px] bg-slate-950/70 border border-slate-800/80 rounded-xl overflow-hidden shadow-inner">
            {/* Editor Toolbar */}
            <div className="flex items-center justify-between px-3 py-2 bg-slate-900/90 border-b border-slate-800 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span>JSON Editor</span>
                {hasValidData && (
                  <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                    <CheckCircle2 className="w-3 h-3" /> Valid
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={handleFormat}
                  className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition cursor-pointer"
                  title="Format / Prettify JSON"
                >
                  <AlignLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleMinify}
                  className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition cursor-pointer"
                  title="Minify JSON"
                >
                  <Minimize2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleCopy}
                  className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition cursor-pointer"
                  title="Copy JSON"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={onClear}
                  className="p-1 hover:bg-rose-950/60 hover:text-rose-300 rounded text-slate-400 transition cursor-pointer"
                  title="Clear content"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Textarea */}
            <div className="relative flex-1 flex flex-col">
              <textarea
                value={rawJson}
                onChange={(e) => setRawJson(e.target.value)}
                placeholder="Paste or write your JSON here..."
                spellCheck={false}
                className="w-full flex-1 p-3 bg-transparent font-mono text-xs text-slate-200 placeholder-slate-600 resize-none focus:outline-none leading-relaxed"
              />
            </div>

            {/* Editor Footer */}
            <div className="px-3 py-1.5 bg-slate-900/60 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500 font-mono">
              <span>{lineCount} {lineCount === 1 ? 'line' : 'lines'}</span>
              <span>{formattedSize}</span>
            </div>
          </div>
        )}

        {/* JSONPath filter section */}
        <div className="p-3.5 bg-slate-950/60 border border-slate-800/80 rounded-xl">
          <JsonPathInput
            value={jsonPath}
            onChange={setJsonPath}
            suggestedPaths={suggestedPaths}
            error={pathError}
          />
        </div>
      </div>
    </div>
  );
};
