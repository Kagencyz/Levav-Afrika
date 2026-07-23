import { useState, useEffect, useCallback, useRef } from 'react';
import { safeJSONParse, safeJSONSet } from '@/lib/safeJSON';

export interface QueuedAction {
  id: string;
  type: 'application' | 'message' | 'review' | string;
  data: Record<string, unknown>;
  timestamp: number;
}

const MAX_QUEUE_SIZE = 100; // Prevent unbounded queue growth
const SYNC_QUEUE_KEY = 'sync_queue';

/** Atomically read-modify-write the sync queue to prevent cross-tab data loss */
function atomicQueueUpdate(updater: (queue: QueuedAction[]) => QueuedAction[]): QueuedAction[] | null {
  try {
    const queue = safeJSONParse<QueuedAction[]>(SYNC_QUEUE_KEY, []);
    const updated = updater(queue);
    // Enforce queue size limit to prevent unbounded growth
    if (updated.length > MAX_QUEUE_SIZE) {
      updated.splice(0, updated.length - MAX_QUEUE_SIZE);
    }
    safeJSONSet(SYNC_QUEUE_KEY, updated);
    return updated;
  } catch {
    return null;
  }
}

export function useOffline() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [syncQueue, setSyncQueue] = useState<QueuedAction[]>(() => {
    return safeJSONParse<QueuedAction[]>(SYNC_QUEUE_KEY, []).slice(0, MAX_QUEUE_SIZE);
  });
  // Use a ref to track the latest queue state for atomic operations
  const queueRef = useRef(syncQueue);
  queueRef.current = syncQueue;

  useEffect(() => {
    const onOnline = () => setIsOffline(false);
    const onOffline = () => setIsOffline(true);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  // Keep syncQueue in sync with localStorage changes from other tabs
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === SYNC_QUEUE_KEY) {
        try {
          const parsed = e.newValue ? JSON.parse(e.newValue) as QueuedAction[] : [];
          setSyncQueue(parsed.slice(0, MAX_QUEUE_SIZE));
        } catch {
          setSyncQueue([]);
        }
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const queueAction = useCallback((action: Omit<QueuedAction, 'id' | 'timestamp'>) => {
    const newItem: QueuedAction = {
      ...action,
      id: `sync-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: Date.now(),
    };
    const updated = atomicQueueUpdate((queue) => [...queue, newItem]);
    if (updated) {
      setSyncQueue(updated);
    }
  }, []);

  const removeFromQueue = useCallback((id: string) => {
    const updated = atomicQueueUpdate((queue) => queue.filter((item) => item.id !== id));
    if (updated) {
      setSyncQueue(updated);
    }
  }, []);

  const clearQueue = useCallback(() => {
    localStorage.removeItem(SYNC_QUEUE_KEY);
    setSyncQueue([]);
  }, []);

  return { isOffline, syncQueue, queueAction, removeFromQueue, clearQueue };
}
