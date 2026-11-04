"use client";

import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { notificationService, type AppNotification } from "~/lib/services/notification.service";

// Polls rather than a websocket — no real-time infra exists elsewhere in
// this codebase, and a 30s interval is plenty responsive for "a purchase
// happened" / "your application was decided" style events.
const POLL_INTERVAL_MS = 30_000;

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const load = async () => {
    try {
      const res = await notificationService.getNotifications(1, 20);
      setNotifications(res.data.notifications);
      setUnreadCount(res.data.unreadCount);
    } catch {
      // Silent — a failed notification fetch shouldn't disrupt the dashboard.
    }
  };

  useEffect(() => {
    void load();
    const interval = setInterval(() => void load(), POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkRead = async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n)));
    setUnreadCount((prev) => Math.max(0, prev - 1));
    try {
      await notificationService.markRead(id);
    } catch {
      void load();
    }
  };

  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read_at: n.read_at ?? new Date().toISOString() })));
    setUnreadCount(0);
    try {
      await notificationService.markAllRead();
    } catch {
      void load();
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
        className="relative rounded-full p-2 transition-colors hover:bg-gray-100"
      >
        <Bell size={20} className="text-gray-700" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 max-w-[90vw] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <span className="font-ubuntu text-sm font-semibold text-gray-900">Notifications</span>
            {unreadCount > 0 && (
              <button onClick={() => void handleMarkAllRead()} className="text-xs font-medium text-(--theme-green-dark) hover:underline">
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-gray-500">No notifications yet.</p>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => !n.read_at && void handleMarkRead(n.id)}
                  className={`block w-full border-b border-gray-50 px-4 py-3 text-left transition hover:bg-gray-50 ${!n.read_at ? "bg-green-50/50" : ""}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-roboto-slab text-sm font-medium text-gray-900">{n.title}</p>
                    {!n.read_at && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-(--theme-green-dark)" />}
                  </div>
                  <p className="font-roboto-slab mt-0.5 text-xs text-gray-600">{n.message}</p>
                  <p className="mt-1 text-[10px] text-gray-400">{timeAgo(n.created_at)}</p>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
