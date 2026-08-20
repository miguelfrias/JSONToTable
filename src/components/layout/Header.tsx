import React, { useState } from 'react';
import { Table, Layers, Share2, Check, BookmarkPlus, Sparkles } from 'lucide-react';
import { generateShareableUrl } from '../../utils/urlHelper';
import { getSnapshotShareUrl, navigateToHome } from '../../utils/routerHelper';
import { SnapshotsDropdown } from '../snapshots/SnapshotsDropdown';
import { SaveSnapshotModal } from '../snapshots/SaveSnapshotModal';
import type { InputSourceType, SnapshotMetadata } from '../../types/table';

interface HeaderProps {
  totalRows: number;
  totalColumns: number;
  sourceType: InputSourceType;
  url: string;
  jsonPath: string;
  rawJson: string;
  globalFilter: string;
  snapshots: SnapshotMetadata[];
  activeSnapshotId: string | null;
  activeSnapshotTitle?: string;
  onSelectSnapshot: (id: string) => void;
  onDeleteSnapshot: (id: string) => void;
  onNewWorkspace: () => void;
  onSaveAsNewSnapshot: (title: string) => Promise<void>;
  onUpdateExistingSnapshot?: (title: string) => Promise<void>;
  snapshotToast: string | null;
}

export const Header: React.FC<HeaderProps> = ({
  totalRows,
  totalColumns,
  sourceType,
  url,
  jsonPath,
  rawJson,
  globalFilter,
  snapshots,
  activeSnapshotId,
  activeSnapshotTitle,
  onSelectSnapshot,
  onDeleteSnapshot,
  onNewWorkspace,
  onSaveAsNewSnapshot,
  onUpdateExistingSnapshot,
  snapshotToast,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

  const handleLogoClick = () => {
    onNewWorkspace();
    navigateToHome();
  };

  const handleShare = () => {
    let shareableUrl: string;
    if (activeSnapshotId) {
      shareableUrl = getSnapshotShareUrl(activeSnapshotId);
    } else {
      shareableUrl = generateShareableUrl({
        sourceType,
        url,
        jsonPath,
        globalFilter,
        rawJson,
      });
    }

    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareableUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <header className="h-14 border-b border-slate-800 bg-slate-900 px-4 flex items-center justify-between shrink-0 select-none z-30">
      {/* Left branding & current snapshot info (Clickable to return home /) */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleLogoClick}
          className="flex items-center gap-2.5 p-1 -ml-1 rounded-xl hover:bg-slate-800/80 transition-all cursor-pointer group text-left"
          title="Return to Home / New Workspace"
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600 group-hover:bg-indigo-500 shadow-md shadow-indigo-950/50 text-white font-bold transition-transform group-hover:scale-105">
            <Table className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-semibold text-slate-100 group-hover:text-indigo-300 flex items-center gap-1.5 leading-none transition-colors">
                <span>JSON to Table</span>
              </h1>
              {activeSnapshotId && (
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" />
                  Snapshot
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 leading-tight mt-0.5 max-w-xs truncate">
              {activeSnapshotTitle ? `Active View: ${activeSnapshotTitle}` : 'Interactive virtual table viewer'}
            </p>
          </div>
        </button>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2.5">
        {/* Toast / Notification */}
        {snapshotToast && (
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-950/90 text-emerald-300 border border-emerald-700/80 text-[11px] font-mono animate-in fade-in">
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>{snapshotToast}</span>
          </div>
        )}

        {/* Snapshots Dropdown */}
        <SnapshotsDropdown
          snapshots={snapshots}
          activeSnapshotId={activeSnapshotId}
          onSelectSnapshot={onSelectSnapshot}
          onDeleteSnapshot={onDeleteSnapshot}
          onNewWorkspace={onNewWorkspace}
        />

        {/* Save Snapshot Button */}
        <button
          onClick={() => setIsSaveModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition cursor-pointer shadow-md shadow-indigo-950/40"
          title="Save current data & table layout to a unique UUID permalink"
        >
          <BookmarkPlus className="w-3.5 h-3.5" />
          <span>Save View (UUID)</span>
        </button>

        {/* Share Link Button */}
        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-slate-600 text-slate-200 text-xs font-medium transition cursor-pointer"
          title="Copy direct permalink URL"
        >
          {copiedLink ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Link Copied!</span>
            </>
          ) : (
            <>
              <Share2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Share Link</span>
            </>
          )}
        </button>

        {/* Total rows & columns counter */}
        {totalRows > 0 && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-950/80 border border-slate-800 text-xs text-slate-300">
            <span className="flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <strong className="text-slate-100">{totalRows}</strong> rows
            </span>
            <span className="text-slate-600">|</span>
            <span className="flex items-center gap-1">
              <span className="text-slate-400">Cols:</span>
              <strong className="text-slate-100">{totalColumns}</strong>
            </span>
          </div>
        )}
      </div>

      {/* Save Snapshot Modal */}
      <SaveSnapshotModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        isExistingSnapshot={Boolean(activeSnapshotId)}
        currentTitle={activeSnapshotTitle}
        rowCount={totalRows}
        columnCount={totalColumns}
        onSaveAsNew={onSaveAsNewSnapshot}
        onUpdateExisting={onUpdateExistingSnapshot}
      />
    </header>
  );
};
