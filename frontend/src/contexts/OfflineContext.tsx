import React, { createContext, useContext, useState, useEffect } from 'react';
import { openDB, IDBPDatabase } from 'idb';

interface OfflineScanItem {
  id?: number;
  crop: string;
  farm_id?: number;
  image_base64: string;
  timestamp: string;
}

interface OfflineContextType {
  isOnline: boolean;
  pendingSyncCount: number;
  queueScanForSync: (scanData: { crop: string; farm_id?: number; image_base64: string }) => Promise<void>;
  syncPendingScans: () => Promise<void>;
}

const DB_NAME = 'KrishiRakshakOfflineDB';
const STORE_NAME = 'offline_scans';

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

export const OfflineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0);
  const [db, setDb] = useState<IDBPDatabase | null>(null);

  // Initialize IndexedDB
  useEffect(() => {
    const initDB = async () => {
      try {
        const idb = await openDB(DB_NAME, 1, {
          upgrade(db) {
            if (!db.objectStoreNames.contains(STORE_NAME)) {
              db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
            }
          },
        });
        setDb(idb);
        const count = await idb.count(STORE_NAME);
        setPendingSyncCount(count);
      } catch (err) {
        console.error('IndexedDB initialization failed:', err);
      }
    };
    initDB();
  }, []);

  // Online / Offline Listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncPendingScans();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [db]);

  const queueScanForSync = async (scanData: { crop: string; farm_id?: number; image_base64: string }) => {
    if (!db) return;
    const item: OfflineScanItem = {
      ...scanData,
      timestamp: new Date().toISOString(),
    };
    await db.add(STORE_NAME, item);
    const count = await db.count(STORE_NAME);
    setPendingSyncCount(count);
  };

  const syncPendingScans = async () => {
    if (!db || !navigator.onLine) return;
    const allScans: OfflineScanItem[] = await db.getAll(STORE_NAME);
    if (allScans.length === 0) return;

    console.log(`Syncing ${allScans.length} offline scans with backend...`);
    for (const scan of allScans) {
      try {
        // Import dynamically to avoid circular dependencies
        const { apiClient } = await import('../api/client');
        await apiClient.post('/api/scans/analyze', {
          crop: scan.crop,
          farm_id: scan.farm_id,
          image_base64: scan.image_base64,
        });
        if (scan.id) {
          await db.delete(STORE_NAME, scan.id);
        }
      } catch (err) {
        console.error('Failed to sync scan:', scan, err);
      }
    }
    const count = await db.count(STORE_NAME);
    setPendingSyncCount(count);
  };

  return (
    <OfflineContext.Provider value={{ isOnline, pendingSyncCount, queueScanForSync, syncPendingScans }}>
      {children}
    </OfflineContext.Provider>
  );
};

export const useOffline = () => {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
};
