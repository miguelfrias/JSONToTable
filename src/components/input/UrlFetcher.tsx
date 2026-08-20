import React, { useState } from 'react';
import { Globe, ArrowRight, Loader2, Sparkles } from 'lucide-react';

interface UrlFetcherProps {
  url: string;
  setUrl: (url: string) => void;
  onFetch: (url: string) => void;
  isLoading: boolean;
}

const POPULAR_ENDPOINTS = [
  { name: 'Products API', url: 'https://dummyjson.com/products', path: '$.products' },
  { name: 'Users API', url: 'https://dummyjson.com/users', path: '$.users' },
  { name: 'Recipes API', url: 'https://dummyjson.com/recipes', path: '$.recipes' },
  { name: 'Quotes API', url: 'https://dummyjson.com/quotes', path: '$.quotes' },
];

export const UrlFetcher: React.FC<UrlFetcherProps> = ({
  url,
  setUrl,
  onFetch,
  isLoading,
}) => {
  const [localUrl, setLocalUrl] = useState(url);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (localUrl.trim()) {
      onFetch(localUrl.trim());
    }
  };

  const handleSelectPreset = (presetUrl: string) => {
    setLocalUrl(presetUrl);
    setUrl(presetUrl);
    onFetch(presetUrl);
  };

  return (
    <div className="space-y-3">
      <form onSubmit={handleSubmit} className="space-y-2">
        <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5 text-indigo-400" />
          <span>Remote JSON Endpoint</span>
        </label>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={localUrl}
              onChange={(e) => {
                setLocalUrl(e.target.value);
                setUrl(e.target.value);
              }}
              placeholder="https://api.example.com/data.json"
              className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500/80 focus:ring-2 focus:ring-indigo-500/20 transition"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !localUrl.trim()}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-lg text-xs font-medium transition cursor-pointer disabled:cursor-not-allowed shadow-md shadow-indigo-950/40 shrink-0"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Fetching...</span>
              </>
            ) : (
              <>
                <span>Fetch</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Preset endpoints */}
      <div className="space-y-1.5 pt-1">
        <div className="text-[11px] text-slate-400 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-indigo-400" />
          <span>Public API Presets (CORS Ready):</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {POPULAR_ENDPOINTS.map((endpoint) => (
            <button
              key={endpoint.name}
              type="button"
              onClick={() => handleSelectPreset(endpoint.url)}
              className="px-2 py-1 rounded bg-slate-800/80 hover:bg-slate-750 border border-slate-700/60 text-slate-300 text-[11px] font-medium transition cursor-pointer"
            >
              {endpoint.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
