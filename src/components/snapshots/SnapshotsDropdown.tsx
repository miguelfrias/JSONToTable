import React, { useState, useRef, useEffect } from 'react';
import {
  FolderArchive,
  Search,
  Check,
  Trash2,
  Plus,
  ChevronDown,
  Layers,
  Database,
} from 'lucide-react';
import type { SnapshotMetadata } from '../../types/table';
import { navigateToViews } from '../../utils/routerHelper';

interface SnapshotsDropdownProps {
  snapshots: SnapshotMetadata[];
  activeSnapshotId: string | null;
  onSelectSnapshot: (id: string) => void;
  onDeleteSnapshot: (id: string) => void;
  onNewWorkspace: () => void;
}

export const SnapshotsDropdown: React.FC<SnapshotsDropdownProps> = ({
  snapshots,
  activeSnapshotId,
  onSelectSnapshot,
  onDeleteSnapshot,
  onNewWorkspace,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const filtered = snapshots.filter((s) =>
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    s.jsonPath.toLowerCase().includes(search.toLowerCase())
  );

  const activeSnapshot = snapshots.find((s) => s.id === activeSnapshotId);

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition cursor-pointer ${
          activeSnapshotId
            ? 'bg-indigo-950/80 border-indigo-700/80 text-indigo-200 hover:bg-indigo-900/80'
            : 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-200'
        }`}
        title="Browse Saved Views & Snapshots"
      >
        <FolderArchive className="w-3.5 h-3.5 text-indigo-400" />
        <span className="max-w-[130px] truncate">
          {activeSnapshot ? activeSnapshot.title : 'Saved Views'}
        </span>
        {snapshots.length > 0 && (
          <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] text-slate-300 font-mono">
            {snapshots.length}
          </span>
        )}
        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 p-3 bg-slate-900 border border-slate-750 rounded-xl shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-xs font-semibold text-slate-200">
            <span>Saved Snapshot Views</span>
            <button
              onClick={() => {
                onNewWorkspace();
                setIsOpen(false);
              }}
              className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium transition cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              New Blank View
            </button>
          </div>

          {/* Search box */}
          {snapshots.length > 3 && (
            <div className="relative mb-2">
              <Search className="w-3 h-3 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search saved views..."
                className="w-full bg-slate-950 border border-slate-800 rounded-md pl-7 pr-2 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-sans"
              />
            </div>
          )}

          {/* Snapshots list */}
          <div className="max-h-60 overflow-y-auto space-y-1 pr-1">
            {snapshots.length === 0 ? (
              <div className="text-center py-5 text-xs text-slate-500">
                No saved snapshot views yet.
                <p className="text-[11px] text-slate-600 mt-1">
                  Click "Save View" to create a permanent URL view.
                </p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-4 text-xs text-slate-500">
                No snapshots match "{search}"
              </div>
            ) : (
              filtered.map((item) => {
                const isActive = item.id === activeSnapshotId;
                return (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between p-2 rounded-lg transition group cursor-pointer ${
                      isActive
                        ? 'bg-indigo-950/70 border border-indigo-700/60'
                        : 'hover:bg-slate-800/80 border border-transparent'
                    }`}
                    onClick={() => {
                      onSelectSnapshot(item.id);
                      setIsOpen(false);
                    }}
                  >
                    <div className="flex items-start gap-2 min-w-0 flex-1">
                      {isActive ? (
                        <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                      ) : (
                        <FolderArchive className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-medium text-slate-200 truncate group-hover:text-indigo-300">
                          {item.title}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                          <span className="font-mono">{new Date(item.createdAt).toLocaleDateString()}</span>
                          {item.rowCount !== undefined && (
                            <span className="flex items-center gap-0.5">
                              <Layers className="w-2.5 h-2.5" />
                              {item.rowCount} rows
                            </span>
                          )}
                          {item.jsonPath && item.jsonPath !== '$' && (
                            <span className="font-mono text-indigo-300/80 bg-slate-950 px-1 rounded">
                              {item.jsonPath}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Delete snapshot "${item.title}"?`)) {
                          onDeleteSnapshot(item.id);
                        }
                      }}
                      className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-950 transition opacity-0 group-hover:opacity-100 cursor-pointer ml-1.5"
                      title="Delete Snapshot"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer link to Storage Manager /#/views */}
          <div className="pt-2 mt-2 border-t border-slate-800 flex items-center justify-between text-xs">
            <button
              onClick={() => {
                navigateToViews();
                setIsOpen(false);
              }}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer text-xs font-medium"
            >
              <Database className="w-3.5 h-3.5 text-indigo-400" />
              <span>Manage All DB Storage (/#/views)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
