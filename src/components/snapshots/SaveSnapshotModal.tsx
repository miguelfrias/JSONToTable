import React, { useState } from 'react';
import { BookmarkPlus, RefreshCw } from 'lucide-react';
import { Modal } from '../common/Modal';

interface SaveSnapshotModalProps {
  isOpen: boolean;
  onClose: () => void;
  isExistingSnapshot: boolean;
  currentTitle?: string;
  rowCount: number;
  columnCount: number;
  onSaveAsNew: (title: string) => Promise<void>;
  onUpdateExisting?: (title: string) => Promise<void>;
}

export const SaveSnapshotModal: React.FC<SaveSnapshotModalProps> = ({
  isOpen,
  onClose,
  isExistingSnapshot,
  currentTitle = '',
  rowCount,
  columnCount,
  onSaveAsNew,
  onUpdateExisting,
}) => {
  const [title, setTitle] = useState(
    currentTitle || `View - ${rowCount} items (${new Date().toLocaleDateString()})`
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveNew = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSaveAsNew(title);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!onUpdateExisting) return;
    setIsSaving(true);
    try {
      await onUpdateExisting(title);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Save Snapshot View" maxWidth="md">
      <form onSubmit={handleSaveNew} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            Snapshot Name / Label:
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Products Q3 Report"
            autoFocus
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg text-xs text-slate-400 space-y-1">
          <div className="flex justify-between">
            <span>Total Records:</span>
            <strong className="text-slate-200 font-mono">{rowCount}</strong>
          </div>
          <div className="flex justify-between">
            <span>Total Columns:</span>
            <strong className="text-slate-200 font-mono">{columnCount}</strong>
          </div>
          <p className="text-[11px] text-indigo-300/80 pt-1">
            This will create a dedicated URL (e.g. <code className="text-indigo-200 font-mono">/#/v/&lt;uuid&gt;</code>) storing your data payload and column customization.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition cursor-pointer"
          >
            Cancel
          </button>

          {isExistingSnapshot && onUpdateExisting && (
            <button
              type="button"
              onClick={handleUpdate}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-750 hover:bg-slate-700 text-slate-100 text-xs font-medium transition cursor-pointer border border-slate-600"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Update Current</span>
            </button>
          )}

          <button
            type="submit"
            disabled={isSaving || !title.trim()}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white text-xs font-medium transition cursor-pointer shadow-md shadow-indigo-950/50"
          >
            <BookmarkPlus className="w-3.5 h-3.5" />
            <span>{isExistingSnapshot ? 'Save as New' : 'Save Snapshot'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
