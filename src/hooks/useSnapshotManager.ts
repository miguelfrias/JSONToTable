import { useState, useEffect, useCallback } from 'react';
import type { TableSnapshot, SnapshotMetadata, InputSourceType } from '../types/table';
import {
  listAllSnapshotsFromDB,
  saveSnapshotToDB,
  loadSnapshotFromDB,
  deleteSnapshotFromDB,
} from '../utils/snapshotStorage';
import { getSnapshotIdFromUrl, navigateToSnapshot, navigateToHome } from '../utils/routerHelper';

export function useSnapshotManager() {
  const [snapshotsList, setSnapshotsList] = useState<SnapshotMetadata[]>([]);
  const [activeSnapshotId, setActiveSnapshotId] = useState<string | null>(getSnapshotIdFromUrl());
  const [activeSnapshot, setActiveSnapshot] = useState<TableSnapshot | null>(null);
  const [isLoadingSnapshot, setIsLoadingSnapshot] = useState<boolean>(false);
  const [snapshotToast, setSnapshotToast] = useState<string | null>(null);

  // Refresh snapshot index
  const refreshList = useCallback(async () => {
    const list = await listAllSnapshotsFromDB();
    setSnapshotsList(list);
  }, []);

  // Initial load of snapshot index
  useEffect(() => {
    refreshList();
  }, [refreshList]);

  // Load active snapshot when activeSnapshotId changes
  const loadSnapshot = useCallback(async (id: string | null) => {
    if (!id) {
      setActiveSnapshot(null);
      return;
    }

    setIsLoadingSnapshot(true);
    try {
      const snapshot = await loadSnapshotFromDB(id);
      if (snapshot) {
        setActiveSnapshot(snapshot);
      } else {
        console.warn(`Snapshot with ID ${id} not found.`);
        setActiveSnapshot(null);
      }
    } catch (err) {
      console.error('Error loading snapshot:', err);
      setActiveSnapshot(null);
    } finally {
      setIsLoadingSnapshot(false);
    }
  }, []);

  // Listen to browser hash changes (e.g. forward/back buttons or link clicks)
  useEffect(() => {
    const handleHashChange = () => {
      const idFromUrl = getSnapshotIdFromUrl();
      setActiveSnapshotId(idFromUrl);
      loadSnapshot(idFromUrl);
    };

    window.addEventListener('hashchange', handleHashChange);
    // Initial load on mount
    handleHashChange();

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [loadSnapshot]);

  // Save New Snapshot
  const createSnapshot = useCallback(
    async (params: {
      title?: string;
      sourceType: InputSourceType;
      url?: string;
      rawJson?: string;
      jsonPath: string;
      globalFilter?: string;
      columnOrder?: string[];
      columnVisibility?: any;
      columnSizing?: any;
      sorting?: any;
      columnFilters?: any;
      rowCount?: number;
      columnCount?: number;
    }): Promise<string> => {
      const id = typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

      const now = Date.now();
      const defaultTitle = params.title?.trim()
        ? params.title.trim()
        : `Snapshot ${new Date(now).toLocaleDateString()} (${params.rowCount || 0} rows)`;

      const newSnapshot: TableSnapshot = {
        id,
        title: defaultTitle,
        createdAt: now,
        updatedAt: now,
        sourceType: params.sourceType,
        url: params.url,
        rawJson: params.rawJson,
        jsonPath: params.jsonPath,
        globalFilter: params.globalFilter,
        columnOrder: params.columnOrder,
        columnVisibility: params.columnVisibility,
        columnSizing: params.columnSizing,
        sorting: params.sorting,
        columnFilters: params.columnFilters,
        rowCount: params.rowCount,
        columnCount: params.columnCount,
      };

      await saveSnapshotToDB(newSnapshot);
      await refreshList();
      setActiveSnapshot(newSnapshot);
      setActiveSnapshotId(id);
      navigateToSnapshot(id);

      setSnapshotToast(`Snapshot "${defaultTitle}" created!`);
      setTimeout(() => setSnapshotToast(null), 3000);
      return id;
    },
    [refreshList]
  );

  // Update existing active snapshot
  const updateSnapshot = useCallback(
    async (params: {
      title?: string;
      sourceType: InputSourceType;
      url?: string;
      rawJson?: string;
      jsonPath: string;
      globalFilter?: string;
      columnOrder?: string[];
      columnVisibility?: any;
      columnSizing?: any;
      sorting?: any;
      columnFilters?: any;
      rowCount?: number;
      columnCount?: number;
    }) => {
      if (!activeSnapshotId) return;

      const now = Date.now();
      const existing = activeSnapshot || (await loadSnapshotFromDB(activeSnapshotId));

      const updatedSnapshot: TableSnapshot = {
        id: activeSnapshotId,
        title: params.title?.trim() || existing?.title || `Snapshot (${params.rowCount || 0} rows)`,
        createdAt: existing?.createdAt || now,
        updatedAt: now,
        sourceType: params.sourceType,
        url: params.url,
        rawJson: params.rawJson,
        jsonPath: params.jsonPath,
        globalFilter: params.globalFilter,
        columnOrder: params.columnOrder,
        columnVisibility: params.columnVisibility,
        columnSizing: params.columnSizing,
        sorting: params.sorting,
        columnFilters: params.columnFilters,
        rowCount: params.rowCount,
        columnCount: params.columnCount,
      };

      await saveSnapshotToDB(updatedSnapshot);
      await refreshList();
      setActiveSnapshot(updatedSnapshot);

      setSnapshotToast(`Snapshot updated at ${new Date(now).toLocaleTimeString()}!`);
      setTimeout(() => setSnapshotToast(null), 3000);
    },
    [activeSnapshotId, activeSnapshot, refreshList]
  );

  // Delete a snapshot
  const deleteSnapshot = useCallback(
    async (id: string) => {
      await deleteSnapshotFromDB(id);
      await refreshList();
      if (activeSnapshotId === id) {
        setActiveSnapshotId(null);
        setActiveSnapshot(null);
        navigateToHome();
      }
      setSnapshotToast('Snapshot deleted');
      setTimeout(() => setSnapshotToast(null), 2500);
    },
    [activeSnapshotId, refreshList]
  );

  // Switch / navigate to another snapshot
  const selectSnapshot = useCallback((id: string) => {
    navigateToSnapshot(id);
  }, []);

  // Create new blank workspace
  const createNewWorkspace = useCallback(() => {
    setActiveSnapshotId(null);
    setActiveSnapshot(null);
    navigateToHome();
  }, []);

  return {
    snapshotsList,
    activeSnapshotId,
    activeSnapshot,
    isLoadingSnapshot,
    snapshotToast,
    createSnapshot,
    updateSnapshot,
    deleteSnapshot,
    selectSnapshot,
    createNewWorkspace,
    refreshList,
  };
}
