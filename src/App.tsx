import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Header } from './components/layout/Header';
import { CollapsibleSidebar } from './components/layout/CollapsibleSidebar';
import { JsonInputPanel } from './components/input/JsonInputPanel';
import { VirtualTable } from './components/table/VirtualTable';
import { EmptyTableState } from './components/table/EmptyTableState';
import { ErrorAlert } from './components/common/ErrorAlert';
import { StorageAdminView } from './components/admin/StorageAdminView';
import { useJsonData } from './hooks/useJsonData';
import { useSnapshotManager } from './hooks/useSnapshotManager';
import { extractUniqueColumnKeys } from './utils/tableHelper';
import { isViewsAdminRoute } from './utils/routerHelper';

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
  const [isViewsRoute, setIsViewsRoute] = useState<boolean>(() => isViewsAdminRoute());

  // Listen to route changes (e.g. #/views vs #/v/<id> vs #/)
  useEffect(() => {
    const handleRouteChange = () => {
      setIsViewsRoute(isViewsAdminRoute());
    };
    window.addEventListener('hashchange', handleRouteChange);
    return () => window.removeEventListener('hashchange', handleRouteChange);
  }, []);

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
    globalFilter,
    setGlobalFilter,
    suggestedPaths,
    tableRows,
    currentError,
    loadSample,
    clearData,
  } = useJsonData();

  const {
    snapshotsList,
    activeSnapshotId,
    activeSnapshot,
    snapshotToast,
    createSnapshot,
    updateSnapshot,
    deleteSnapshot,
    selectSnapshot,
    createNewWorkspace,
  } = useSnapshotManager();

  // When active snapshot changes, hydrate the JSON data inputs
  useEffect(() => {
    if (activeSnapshot) {
      if (activeSnapshot.sourceType) setSourceType(activeSnapshot.sourceType);
      if (activeSnapshot.url) setUrl(activeSnapshot.url);
      if (activeSnapshot.rawJson !== undefined) setRawJson(activeSnapshot.rawJson);
      if (activeSnapshot.jsonPath) setJsonPath(activeSnapshot.jsonPath);
      if (activeSnapshot.globalFilter !== undefined) setGlobalFilter(activeSnapshot.globalFilter);
    }
  }, [activeSnapshot, setSourceType, setUrl, setRawJson, setJsonPath, setGlobalFilter]);

  const totalColumns = tableRows.length > 0 ? extractUniqueColumnKeys(tableRows).length : 0;
  const hasValidData = tableRows.length > 0 && !currentError;

  // Save as new snapshot handler
  const handleSaveAsNewSnapshot = async (title: string) => {
    await createSnapshot({
      title,
      sourceType,
      url,
      rawJson,
      jsonPath,
      globalFilter,
      rowCount: tableRows.length,
      columnCount: totalColumns,
    });
  };

  // Update existing snapshot handler
  const handleUpdateExistingSnapshot = async (title: string) => {
    await updateSnapshot({
      title,
      sourceType,
      url,
      rawJson,
      jsonPath,
      globalFilter,
      rowCount: tableRows.length,
      columnCount: totalColumns,
    });
  };

  // Render Storage Admin View if on #/views
  if (isViewsRoute) {
    return (
      <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans select-none">
        <StorageAdminView />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans select-none">
      {/* Top Header */}
      <Header
        totalRows={tableRows.length}
        totalColumns={totalColumns}
        sourceType={sourceType}
        url={url}
        jsonPath={jsonPath}
        rawJson={rawJson}
        globalFilter={globalFilter}
        snapshots={snapshotsList}
        activeSnapshotId={activeSnapshotId}
        activeSnapshotTitle={activeSnapshot?.title}
        onSelectSnapshot={selectSnapshot}
        onDeleteSnapshot={deleteSnapshot}
        onNewWorkspace={createNewWorkspace}
        onSaveAsNewSnapshot={handleSaveAsNewSnapshot}
        onUpdateExistingSnapshot={activeSnapshotId ? handleUpdateExistingSnapshot : undefined}
        snapshotToast={snapshotToast}
      />

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
                globalFilter={globalFilter}
                setGlobalFilter={setGlobalFilter}
                snapshot={activeSnapshot}
                onSaveSnapshot={() => {
                  const title = prompt('Enter a name for this snapshot:');
                  if (title && title.trim()) {
                    handleSaveAsNewSnapshot(title.trim());
                  }
                }}
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
