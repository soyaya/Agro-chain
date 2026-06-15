"use client";

import { useState, useEffect, useCallback } from "react";
import type { Notification } from "~/types/index";
import { notificationService } from "~/lib/services/notification.service";

const POLL_INTERVAL_MS = 60_000;

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    const res = await notificationService.getNotifications();
    setNotifications(res.data.notifications ?? []);
    setUnreadCount(res.data.unreadCount ?? 0);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchNotifications();
    const id = setInterval(() => {
      void fetchNotifications();
    }, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [fetchNotifications]);

  const markRead = async (notificationId: string) => {
    await notificationService.markRead(notificationId);
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)),
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  const markAllRead = async () => {
    await notificationService.markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  return {
    notifications,
    unreadCount,
    markRead,
    markAllRead,
    refresh: fetchNotifications,
  };
}
