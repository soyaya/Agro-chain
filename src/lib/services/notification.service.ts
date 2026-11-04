import { apiFetch } from "~/lib/api";

export interface AppNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  metadata: Record<string, unknown> | null;
  read_at: string | null;
  created_at: string;
}

export interface NotificationsResponse {
  status: string;
  data: {
    notifications: AppNotification[];
    unreadCount: number;
    pagination: { total: number; page: number; limit: number; totalPages: number };
  };
}

export const notificationService = {
  getNotifications(page = 1, limit = 20) {
    return apiFetch<NotificationsResponse>(`/notifications?page=${page}&limit=${limit}`);
  },

  markRead(id: string) {
    return apiFetch(`/notifications/${id}/read`, { method: "PATCH" });
  },

  markAllRead() {
    return apiFetch("/notifications/read-all", { method: "PATCH" });
  },
};
