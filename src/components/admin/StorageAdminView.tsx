import React, { useState, useEffect, useCallback } from 'react';
import {
  Database,
  Trash2,
  RefreshCw,
  ArrowLeft,
  Eye,
  AlertTriangle,
  HardDrive,
  FolderArchive,
  FileCode,
  Layers,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import {
  getAllIndexedDbEntries,
  deleteIndexedDbKey,
  clearAllAppStorage,
  convertLegacyPayloadToSnapshot,
  formatByteSize,
  type StorageItemDetail,
} from '../../utils/adminStorageHelper';
import { navigateToHome, navigateToSnapshot } from '../../utils/routerHelper';
import { Modal } from '../common/Modal';

export const StorageAdminView: React.FC = () => {
  const [entries, setEntries] = useState<StorageItemDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<StorageItemDetail | null>(null);
  const [isWipeModalOpen, setIsWipeModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getAllIndexedDbEntries();
      setEntries(data);
    } catch (err) {
      console.error('Failed to load storage entries:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDeleteKey = async (item: StorageItemDetail) => {
    if (confirm(`Delete storage key "${item.key}"?`)) {
      try {
        await deleteIndexedDbKey(item.key);
        showToast(`Deleted key "${item.key}"`);
        await loadData();
      } catch (err: any) {
        alert(`Failed to delete key: ${err.message || String(err)}`);
      }
    }
  };

  const handleConvertLegacy = async (item: StorageItemDetail) => {
    try {
      const newSnapshotId = await convertLegacyPayloadToSnapshot(item.key);
      showToast('Legacy data converted into snapshot view!');
      await loadData();
      navigateToSnapshot(newSnapshotId);
    } catch (err: any) {
      alert(`Conversion failed: ${err.message || String(err)}`);
    }
  };

  const handleWipeDatabase = async () => {
    try {
      await clearAllAppStorage();
      setIsWipeModalOpen(false);
      showToast('IndexedDB database and localStorage wiped completely!');
      await loadData();
    } catch (err: any) {
      alert(`Failed to wipe storage: ${err.message || String(err)}`);
    }
  };

  const totalBytes = entries.reduce((sum, item) => sum + item.sizeBytes, 0);
  const snapshotCount = entries.filter((e) => e.category === 'snapshot').length;
  const legacyCount = entries.filter((e) => e.category === 'legacy_data').length;

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 overflow-y-auto p-6 font-sans">
      {/* Top Header Navigation */}
      <div className="max-w-6xl w-full mx-auto space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <button
              onClick={navigateToHome}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Table Viewer</span>
            </button>
            <button
              onClick={navigateToHome}
              className="text-left group cursor-pointer p-1 -ml-1 rounded-lg hover:bg-slate-900/60 transition"
              title="Return to Home Table Viewer"
            >
              <h2 className="text-lg font-bold text-slate-100 group-hover:text-indigo-300 flex items-center gap-2 leading-none transition-colors">
                <Database className="w-5 h-5 text-indigo-400" />
                <span>IndexedDB Storage Manager</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                  /#/views
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Inspect, convert legacy payloads, delete individual keys, or clear entire database storage.
              </p>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-850 hover:bg-slate-800 border border-slate-750 text-slate-200 text-xs font-medium transition cursor-pointer"
              title="Refresh IndexedDB keys"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            <button
              onClick={() => setIsWipeModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 border border-rose-700/60 text-rose-300 text-xs font-medium transition cursor-pointer shadow-sm"
              title="Wipe all entries in IndexedDB & localStorage"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Wipe Entire Database</span>
            </button>
          </div>
        </div>

        {/* Toast Alert */}
        {toastMessage && (
          <div className="p-3 bg-emerald-950/90 border border-emerald-700/80 rounded-xl text-xs font-medium text-emerald-200 flex items-center justify-between animate-in fade-in">
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Metrics Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center gap-3">
            <div className="p-2.5 bg-indigo-950/60 border border-indigo-800/60 rounded-lg text-indigo-400">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Total Storage Size</div>
              <div className="text-lg font-bold font-mono text-slate-100">{formatByteSize(totalBytes)}</div>
            </div>
          </div>

          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center gap-3">
            <div className="p-2.5 bg-cyan-950/60 border border-cyan-800/60 rounded-lg text-cyan-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Total IndexedDB Keys</div>
              <div className="text-lg font-bold font-mono text-slate-100">{entries.length}</div>
            </div>
          </div>

          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center gap-3">
            <div className="p-2.5 bg-emerald-950/60 border border-emerald-800/60 rounded-lg text-emerald-400">
              <FolderArchive className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Saved Snapshot Views</div>
              <div className="text-lg font-bold font-mono text-slate-100">{snapshotCount}</div>
            </div>
          </div>

          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center gap-3">
            <div className="p-2.5 bg-amber-950/60 border border-amber-800/60 rounded-lg text-amber-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Legacy Data Keys</div>
              <div className="text-lg font-bold font-mono text-slate-100">{legacyCount}</div>
            </div>
          </div>
        </div>

        {/* Legacy data conversion banner if legacy data detected */}
        {legacyCount > 0 && (
          <div className="p-4 bg-amber-950/30 border border-amber-800/60 rounded-xl flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <div className="text-xs font-semibold text-amber-200">
                  Legacy Saved Data Detected ({legacyCount} entry)
                </div>
                <p className="text-xs text-amber-300/80 mt-0.5">
                  You have unmigrated JSON data stored from earlier versions. You can convert it into a permanent snapshot view or delete it.
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                const legacy = entries.find((e) => e.category === 'legacy_data');
                if (legacy) handleConvertLegacy(legacy);
              }}
              className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-semibold rounded-lg text-xs transition cursor-pointer shadow-md"
            >
              Convert to Snapshot View
            </button>
          </div>
        )}

        {/* Storage Keys Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="px-4 py-3 bg-slate-850/80 border-b border-slate-800 flex items-center justify-between text-xs font-semibold text-slate-200">
            <span>IndexedDB Key Entries ({entries.length})</span>
          </div>

          <div className="divide-y divide-slate-800/80">
            {entries.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                IndexedDB storage is currently empty.
              </div>
            ) : (
              entries.map((item) => (
                <div
                  key={item.key}
                  className="p-4 hover:bg-slate-850/40 transition flex items-center justify-between gap-4 flex-wrap"
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="p-2 bg-slate-800 rounded-lg text-slate-400 mt-0.5 shrink-0">
                      {item.category === 'snapshot' ? (
                        <FolderArchive className="w-4 h-4 text-indigo-400" />
                      ) : item.category === 'legacy_data' ? (
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                      ) : item.category === 'index' ? (
                        <Layers className="w-4 h-4 text-cyan-400" />
                      ) : (
                        <FileCode className="w-4 h-4 text-slate-400" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono font-bold text-slate-100">
                          {item.key}
                        </span>

                        <span
                          className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                            item.category === 'snapshot'
                              ? 'bg-indigo-950 text-indigo-300 border-indigo-800'
                              : item.category === 'legacy_data'
                              ? 'bg-amber-950 text-amber-300 border-amber-800'
                              : item.category === 'index'
                              ? 'bg-cyan-950 text-cyan-300 border-cyan-800'
                              : 'bg-slate-800 text-slate-300 border-slate-700'
                          }`}
                        >
                          {item.category}
                        </span>

                        <span className="text-xs font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                          {item.formattedSize}
                        </span>

                        {item.itemCount !== undefined && (
                          <span className="text-xs text-slate-400 font-mono">
                            {item.itemCount} items
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-slate-300 font-medium mt-1">
                        {item.label}
                      </div>

                      <p className="text-[11px] font-mono text-slate-500 truncate max-w-2xl mt-1">
                        {item.previewSnippet}
                      </p>
                    </div>
                  </div>

                  {/* Actions for this key */}
                  <div className="flex items-center gap-2 shrink-0">
                    {item.category === 'snapshot' && (
                      <button
                        onClick={() => {
                          const snapshotId = item.key.replace('json_table_snapshot_', '');
                          navigateToSnapshot(snapshotId);
                        }}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-700/60 text-xs font-medium transition cursor-pointer"
                        title="Open this snapshot view in table"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Open View</span>
                      </button>
                    )}

                    {item.category === 'legacy_data' && (
                      <button
                        onClick={() => handleConvertLegacy(item)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-700/60 text-xs font-medium transition cursor-pointer"
                        title="Convert legacy data to snapshot"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Convert</span>
                      </button>
                    )}

                    <button
                      onClick={() => setSelectedItem(item)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition cursor-pointer"
                      title="Inspect Raw Value"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDeleteKey(item)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 hover:text-rose-300 text-slate-400 text-xs transition cursor-pointer border border-transparent hover:border-rose-800"
                      title="Delete this key"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Raw JSON Value Inspector Modal */}
      {selectedItem && (
        <Modal
          isOpen={Boolean(selectedItem)}
          onClose={() => setSelectedItem(null)}
          title={`Inspect Key: ${selectedItem.key}`}
          maxWidth="2xl"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Size: <strong className="text-slate-200 font-mono">{selectedItem.formattedSize}</strong></span>
              <button
                onClick={() => {
                  const text = typeof selectedItem.value === 'string'
                    ? selectedItem.value
                    : JSON.stringify(selectedItem.value, null, 2);
                  navigator.clipboard.writeText(text);
                  showToast('Copied JSON to clipboard!');
                }}
                className="text-indigo-400 hover:text-indigo-300 transition cursor-pointer"
              >
                Copy Content
              </button>
            </div>

            <pre className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-200 overflow-x-auto max-h-[60vh] leading-relaxed">
              {typeof selectedItem.value === 'string'
                ? selectedItem.value
                : JSON.stringify(selectedItem.value, null, 2)}
            </pre>
          </div>
        </Modal>
      )}

      {/* Wipe Confirmation Modal */}
      <Modal
        isOpen={isWipeModalOpen}
        onClose={() => setIsWipeModalOpen(false)}
        title="Confirm Database Wipe"
        maxWidth="md"
      >
        <div className="space-y-4 text-center p-2">
          <div className="mx-auto w-12 h-12 rounded-full bg-rose-950/60 border border-rose-800/80 text-rose-400 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>

          <div>
            <h3 className="text-sm font-bold text-rose-200">
              Are you sure you want to wipe everything?
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              This will permanently delete all snapshots, legacy cached payloads, and localStorage configurations. This cannot be undone.
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setIsWipeModalOpen(false)}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleWipeDatabase}
              className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition cursor-pointer shadow-md shadow-rose-950/50"
            >
              Yes, Wipe All Storage
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
