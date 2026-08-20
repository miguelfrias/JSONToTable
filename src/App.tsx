import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Header } from './components/layout/Header';
import { CollapsibleSidebar } from './components/layout/CollapsibleSidebar';
import { JsonInputPanel } from './components/input/JsonInputPanel';
import { VirtualTable } from './components/table/VirtualTable';
import { EmptyTableState } from './components/table/EmptyTableState';
import { ErrorAlert } from './components/common/ErrorAlert';
import { useJsonData } from './hooks/useJsonData';
import { extractUniqueColumnKeys } from './utils/tableHelper';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const JsonTableApp: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const {
    sourceType,
    setSourceType,
    rawJson,
    setRawJson,
    url,
    setUrl,
    triggerFetch,
    isFetching,
    jsonPath,
    setJsonPath,
    suggestedPaths,
    tableRows,
    currentError,
    loadSample,
    clearData,
  } = useJsonData();

  const totalColumns = tableRows.length > 0 ? extractUniqueColumnKeys(tableRows).length : 0;
  const hasValidData = tableRows.length > 0 && !currentError;

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans select-none">
      {/* Top Header */}
      <Header totalRows={tableRows.length} totalColumns={totalColumns} />

      {/* Main workspace layout */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Collapsible Input Panel */}
        <CollapsibleSidebar
          isCollapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        >
          <JsonInputPanel
            sourceType={sourceType}
            setSourceType={setSourceType}
            rawJson={rawJson}
            setRawJson={setRawJson}
            url={url}
            setUrl={setUrl}
            onFetchUrl={triggerFetch}
            isFetching={isFetching}
            jsonPath={jsonPath}
            setJsonPath={setJsonPath}
            suggestedPaths={suggestedPaths}
            pathError={currentError?.type === 'jsonpath' ? currentError.message : null}
            onLoadSample={loadSample}
            onClear={clearData}
            hasValidData={hasValidData}
          />
        </CollapsibleSidebar>

        {/* Right Table / Main Canvas Area */}
        <main className="flex-1 flex flex-col h-full min-w-0 overflow-hidden bg-slate-950 relative">
          {/* Error Banner if error exists */}
          {currentError && (
            <div className="p-4 border-b border-slate-800 bg-slate-950/90 z-20 shrink-0">
              <ErrorAlert error={currentError} />
            </div>
          )}

          {/* Table Container or Empty / Error state */}
          <div className="flex-1 overflow-hidden relative">
            {currentError && tableRows.length === 0 ? (
              <EmptyTableState
                type="error"
                errorMessage={currentError.message}
                onLoadSample={() => loadSample('products')}
              />
            ) : tableRows.length === 0 ? (
              <EmptyTableState
                type="no-data"
                onLoadSample={() => loadSample('products')}
              />
            ) : (
              <VirtualTable
                data={tableRows}
                onLoadSample={() => loadSample('products')}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <JsonTableApp />
    </QueryClientProvider>
  );
}
