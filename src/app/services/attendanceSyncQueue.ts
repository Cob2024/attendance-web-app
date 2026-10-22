// ============================================================
// Eventual Consistency: Client Outbox Queue Service
// Manages offline-first attendance check-ins, automatic background
// draining, conflict reconciliation, and real-time UI state sync.
// ============================================================

import { syncAttendanceQueueApi } from './apiData';
import { toast } from 'sonner';

export interface QueuedAttendanceItem {
  clientQueueId: string;
  courseId: string;
  courseName?: string;
  courseCode?: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  capturedAt: string; // ISO 8601 string
  syncAttempts: number;
  lastAttemptAt?: string;
  status: 'pending' | 'syncing' | 'synced' | 'failed';
  lastError?: string;
}

const STORAGE_KEY = 'smartattend_outbox_queue_v1';
const MAX_AUTO_RETRIES = 5;

type QueueListener = (queue: QueuedAttendanceItem[]) => void;
const listeners: Set<QueueListener> = new Set();

let isDraining = false;
let drainIntervalId: any = null;

// Helper: generate a collision-resistant unique client ID
const generateQueueId = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `sync_${crypto.randomUUID()}`;
  }
  return `sync_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

// Safe storage accessors
export const getStoredQueue = (): QueuedAttendanceItem[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('[AttendanceQueue] Failed to read from localStorage:', err);
    return [];
  }
};

const saveQueue = (queue: QueuedAttendanceItem[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
    notifyListeners(queue);
  } catch (err) {
    console.error('[AttendanceQueue] Failed to write to localStorage:', err);
  }
};

const notifyListeners = (queue: QueuedAttendanceItem[]) => {
  listeners.forEach((listener) => {
    try {
      listener(queue);
    } catch (err) {
      console.error('[AttendanceQueue] Listener callback error:', err);
    }
  });
};

// Subscriber hook for React components
export const subscribeToSyncQueue = (listener: QueueListener): (() => void) => {
  listeners.add(listener);
  listener(getStoredQueue()); // Immediate first tick
  return () => {
    listeners.delete(listener);
  };
};

// Enqueue a captured attendance check-in
export const enqueueAttendanceItem = (data: {
  courseId: string;
  courseName?: string;
  courseCode?: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  capturedAt?: string;
}): QueuedAttendanceItem => {
  const queue = getStoredQueue();
  const capturedAt = data.capturedAt || new Date().toISOString();

  // Avoid duplicate queuing for the same course on the same date
  const todayStr = capturedAt.split('T')[0];
  const existingIdx = queue.findIndex(
    (item) => item.courseId === data.courseId && item.capturedAt.startsWith(todayStr)
  );

  const newItem: QueuedAttendanceItem = {
    clientQueueId: generateQueueId(),
    courseId: data.courseId,
    courseName: data.courseName,
    courseCode: data.courseCode,
    latitude: data.latitude,
    longitude: data.longitude,
    accuracy: data.accuracy,
    capturedAt,
    syncAttempts: 0,
    status: 'pending',
  };

  if (existingIdx >= 0) {
    // Replace with latest capture
    queue[existingIdx] = newItem;
  } else {
    queue.push(newItem);
  }

  saveQueue(queue);

  // Trigger background drain asynchronously
  setTimeout(() => {
    drainAttendanceQueue();
  }, 100);

  return newItem;
};

// Check if a course has pending attendance in the outbox
export const isCoursePendingSync = (courseId: string): boolean => {
  const queue = getStoredQueue();
  const todayStr = new Date().toISOString().split('T')[0];
  return queue.some(
    (item) =>
      item.courseId === courseId &&
      item.capturedAt.startsWith(todayStr) &&
      (item.status === 'pending' || item.status === 'syncing')
  );
};

// Get pending item for a specific course
export const getPendingItemForCourse = (courseId: string): QueuedAttendanceItem | undefined => {
  const queue = getStoredQueue();
  const todayStr = new Date().toISOString().split('T')[0];
  return queue.find(
    (item) => item.courseId === courseId && item.capturedAt.startsWith(todayStr)
  );
};

// Remove an item from the queue
export const removeQueueItem = (clientQueueId: string) => {
  const queue = getStoredQueue();
  const updated = queue.filter((item) => item.clientQueueId !== clientQueueId);
  saveQueue(updated);
};

// Retry a failed item
export const retryFailedItem = async (clientQueueId: string) => {
  const queue = getStoredQueue();
  const updated = queue.map((item) => {
    if (item.clientQueueId === clientQueueId) {
      return {
        ...item,
        status: 'pending' as const,
        syncAttempts: 0,
        lastError: undefined,
      };
    }
    return item;
  });
  saveQueue(updated);
  await drainAttendanceQueue();
};

// Clear all synced or failed items
export const clearSyncedItems = () => {
  const queue = getStoredQueue();
  const updated = queue.filter((item) => item.status !== 'synced');
  saveQueue(updated);
};

export const clearFailedItems = () => {
  const queue = getStoredQueue();
  const updated = queue.filter((item) => item.status !== 'failed');
  saveQueue(updated);
};

// ============================================================
// Core Drain & Reconcile Engine
// ============================================================
export const drainAttendanceQueue = async (): Promise<{
  attempted: number;
  synced: number;
  rejected: number;
}> => {
  if (isDraining) {
    return { attempted: 0, synced: 0, rejected: 0 };
  }

  // Network check
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return { attempted: 0, synced: 0, rejected: 0 };
  }

  const currentQueue = getStoredQueue();
  const itemsToSync = currentQueue.filter(
    (item) =>
      item.status === 'pending' ||
      (item.status === 'failed' && item.syncAttempts < MAX_AUTO_RETRIES)
  );

  if (itemsToSync.length === 0) {
    return { attempted: 0, synced: 0, rejected: 0 };
  }

  isDraining = true;

  // Mark selected items as 'syncing'
  const inFlightIds = new Set(itemsToSync.map((i) => i.clientQueueId));
  const markedQueue = currentQueue.map((item) => {
    if (inFlightIds.has(item.clientQueueId)) {
      return {
        ...item,
        status: 'syncing' as const,
        lastAttemptAt: new Date().toISOString(),
      };
    }
    return item;
  });
  saveQueue(markedQueue);

  let syncedCount = 0;
  let rejectedCount = 0;

  try {
    const payload = itemsToSync.map((item) => ({
      clientQueueId: item.clientQueueId,
      courseId: item.courseId,
      latitude: item.latitude,
      longitude: item.longitude,
      accuracy: item.accuracy,
      capturedAt: item.capturedAt,
    }));

    const response = await syncAttendanceQueueApi(payload);

    if (response && response.success && Array.isArray(response.results)) {
      const resultsMap = new Map<string, { status: string; recordId?: string; distance?: number; error?: string }>();
      response.results.forEach((r: any) => {
        if (r.clientQueueId) {
          resultsMap.set(r.clientQueueId, r);
        }
      });

      const updatedQueue: QueuedAttendanceItem[] = [];

      for (const item of getStoredQueue()) {
        const result = resultsMap.get(item.clientQueueId);

        if (result) {
          if (result.status === 'synced') {
            syncedCount++;
            toast.success(
              `Offline Attendance Synced! ${item.courseCode || item.courseName || 'Class'} check-in verified. (${result.distance || 0}m)`,
              { icon: '📡' }
            );

            // Notify app components to re-fetch attendance records
            if (typeof window !== 'undefined') {
              window.dispatchEvent(
                new CustomEvent('smartattend:attendance-synced', {
                  detail: { clientQueueId: item.clientQueueId, courseId: item.courseId },
                })
              );
            }
            // Synced items are successfully settled; omit from retained queue
            continue;
          } else {
            // Rejected
            rejectedCount++;
            const attempts = (item.syncAttempts || 0) + 1;
            updatedQueue.push({
              ...item,
              status: 'failed',
              syncAttempts: attempts,
              lastError: result.error || 'Server rejected check-in',
            });
            toast.error(
              `Sync rejected for ${item.courseCode || 'course'}: ${result.error || 'Out of range'}`,
              { duration: 5000 }
            );
          }
        } else {
          // Keep item untouched if not mentioned in results
          updatedQueue.push(item);
        }
      }

      saveQueue(updatedQueue);
    } else {
      // API call failed (e.g. server error or connection timed out)
      const rolledBack = getStoredQueue().map((item) => {
        if (inFlightIds.has(item.clientQueueId)) {
          const attempts = (item.syncAttempts || 0) + 1;
          return {
            ...item,
            status: (attempts >= MAX_AUTO_RETRIES ? 'failed' : 'pending') as const,
            syncAttempts: attempts,
            lastError: response?.error || 'Network error while syncing queue',
          };
        }
        return item;
      });
      saveQueue(rolledBack);
    }
  } catch (err: any) {
    console.error('[AttendanceQueue] Error draining queue:', err);
    const rolledBack = getStoredQueue().map((item) => {
      if (inFlightIds.has(item.clientQueueId)) {
        const attempts = (item.syncAttempts || 0) + 1;
        return {
          ...item,
          status: (attempts >= MAX_AUTO_RETRIES ? 'failed' : 'pending') as const,
          syncAttempts: attempts,
          lastError: err?.message || 'Unexpected sync error',
        };
      }
      return item;
    });
    saveQueue(rolledBack);
  } finally {
    isDraining = false;
  }

  return { attempted: itemsToSync.length, synced: syncedCount, rejected: rejectedCount };
};

// ============================================================
// Auto-Draining Initializer (Call in main.tsx or App.tsx)
// ============================================================
export const initAttendanceSyncQueue = () => {
  if (typeof window === 'undefined') return;

  // Listen to browser network reconnection
  window.addEventListener('online', () => {
    console.log('[AttendanceQueue] Browser back online. Draining attendance queue...');
    drainAttendanceQueue();
  });

  // Cross-tab synchronization
  window.addEventListener('storage', (event) => {
    if (event.key === STORAGE_KEY) {
      notifyListeners(getStoredQueue());
    }
  });

  // Periodic heartbeat: attempt drain every 25 seconds if items are queued
  if (!drainIntervalId) {
    drainIntervalId = setInterval(() => {
      const queue = getStoredQueue();
      const hasUnsynced = queue.some(
        (i) => i.status === 'pending' || (i.status === 'failed' && i.syncAttempts < MAX_AUTO_RETRIES)
      );
      if (hasUnsynced && navigator.onLine) {
        drainAttendanceQueue();
      }
    }, 25000);
  }

  // Drain immediately on initialization if online
  if (navigator.onLine) {
    drainAttendanceQueue();
  }
};

