import { useSyncExternalStore } from 'react';
import { toast } from 'sonner';

export type NotificationCategory =
  | 'invoice'
  | 'receipt'
  | 'profile'
  | 'approval'
  | 'general';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  category: NotificationCategory;
  /** Hash route (without leading #) of the module this notification belongs to */
  link: string;
  createdAt: string;
  read: boolean;
}

const STORAGE_KEY = 'farmiq_notifications';
const MAX_ITEMS = 60;

let items: AppNotification[] = load();
const listeners = new Set<() => void>();

function load(): AppNotification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AppNotification[]) : [];
  } catch {
    return [];
  }
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* ignore quota errors */
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const getSnapshot = () => items;

export function notify(input: {
  title: string;
  message: string;
  category?: NotificationCategory;
  link?: string;
  silent?: boolean;
}) {
  const entry: AppNotification = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: input.title,
    message: input.message,
    category: input.category ?? 'general',
    link: input.link ?? '/dashboard',
    createdAt: new Date().toISOString(),
    read: false,
  };
  items = [entry, ...items].slice(0, MAX_ITEMS);
  persist();

  if (!input.silent) {
    toast.success(entry.title, {
      description: entry.message,
      action: {
        label: 'View',
        onClick: () => {
          window.location.hash = `#${entry.link}`;
        },
      },
    });
  }
  return entry;
}

export function markRead(id: string) {
  items = items.map((n) => (n.id === id ? { ...n, read: true } : n));
  persist();
}

export function markAllRead() {
  items = items.map((n) => ({ ...n, read: true }));
  persist();
}

export function clearNotifications() {
  items = [];
  persist();
}

export function useNotifications() {
  const list = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return {
    notifications: list,
    unreadCount: list.filter((n) => !n.read).length,
    markRead,
    markAllRead,
    clearNotifications,
  };
}

export function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}
