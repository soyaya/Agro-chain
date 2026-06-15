import { apiFetch, ApiError } from "~/lib/api";
import type { Notification } from "~/types/index";

export interface NotificationsResponse {
  status: string;
  data: {
    notifications: Notification[];
    unreadCount: number;
  };
}

export const notificationService = {
  getNotifications(): Promise<NotificationsResponse> {
    return apiFetch<NotificationsResponse>("/notifications").catch((err) => {
      if (
        err instanceof ApiError &&
        (err.status === 404 || err.status === 401 || err.status === 0)
      ) {
        return { status: "ok", data: { notifications: [], unreadCount: 0 } };
      }
      return { status: "ok", data: { notifications: [], unreadCount: 0 } };
    });
  },

  markRead(notificationId: string) {
    return apiFetch(`/notifications/${notificationId}/read`, {
      method: "PATCH",
    }).catch(() => null);
  },

  markAllRead() {
    return apiFetch("/notifications/read-all", { method: "PATCH" }).catch(
      () => null,
    );
  },
};
