"use client";

import { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  X,
  CheckCheck,
  Info,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
} from "lucide-react";
import type { Notification } from "~/types/index";
import { useNotifications } from "~/hooks/useNotifications";
import { cn } from "~/lib/utils";

const TYPE_CONFIG = {
  info: { icon: Info, color: "text-blue-600", bg: "bg-blue-50" },
  success: {
    icon: CheckCircle,
    color: "text-theme-green-dark",
    bg: "bg-green-tint",
  },
  warning: {
    icon: AlertTriangle,
    color: "text-yellow-600",
    bg: "bg-yellow-50",
  },
  error: { icon: AlertCircle, color: "text-red-600", bg: "bg-red-50" },
} satisfies Record<
  Notification["type"],
  { icon: typeof Info; color: string; bg: string }
>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationsPanel({ isOpen, onClose }: Props) {
  const { notifications, unreadCount, markRead, markAllRead } =
    useNotifications();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        isOpen &&
        panelRef.current &&
        !panelRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={panelRef}
          initial={{ opacity: 0, y: -8, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.97 }}
          transition={{ duration: 0.15 }}
          className="border-gray-border absolute top-full right-0 z-50 mt-2 w-80 rounded-2xl border bg-(--white) shadow-xl sm:w-96"
        >
          {/* Header */}
          <div className="border-gray-border flex items-center justify-between border-b px-4 py-3">
            <div className="flex items-center gap-2">
              <Bell size={16} className="text-text-colour" />
              <span className="font-ubuntu text-heading-colour text-sm font-semibold">
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="bg-theme-green-dark rounded-full px-2 py-0.5 text-xs font-medium text-white">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={() => void markAllRead()}
                  className="font-roboto-slab text-muted-text hover:bg-gray-bg hover:text-text-colour-2 flex items-center gap-1 rounded-lg px-2 py-1 text-xs transition-colors"
                  title="Mark all as read"
                >
                  <CheckCheck size={13} />
                  All read
                </button>
              )}
              <button
                onClick={onClose}
                className="text-muted-text hover:bg-gray-bg hover:text-text-colour rounded-lg p-1 transition-colors"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
                <Bell size={32} className="text-muted-text" />
                <p className="font-roboto-slab text-muted-text text-sm">
                  No notifications yet
                </p>
              </div>
            ) : (
              <ul className="divide-gray-bg divide-y">
                {notifications.map((n) => {
                  const cfg = TYPE_CONFIG[n.type];
                  const Icon = cfg.icon;
                  return (
                    <li
                      key={n.id}
                      onClick={() => {
                        if (!n.read) void markRead(n.id);
                      }}
                      className={cn(
                        "hover:bg-gray-bg flex cursor-pointer items-start gap-3 px-4 py-3 transition-colors",
                        !n.read && "bg-green-tint/40",
                      )}
                    >
                      <div
                        className={cn(
                          "mt-0.5 shrink-0 rounded-lg p-1.5",
                          cfg.bg,
                        )}
                      >
                        <Icon size={14} className={cfg.color} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p
                          className={cn(
                            "font-roboto-slab text-heading-colour text-sm",
                            !n.read && "font-semibold",
                          )}
                        >
                          {n.title}
                        </p>
                        <p className="font-roboto-slab text-muted-text mt-0.5 line-clamp-2 text-xs">
                          {n.message}
                        </p>
                        <p className="font-roboto-slab text-muted-text mt-1 text-xs">
                          {new Date(n.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      {!n.read && (
                        <div className="bg-theme-green-dark mt-1.5 h-2 w-2 shrink-0 rounded-full" />
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface BellButtonProps {
  onClick: () => void;
}

export function NotificationsBell({ onClick }: BellButtonProps) {
  const { unreadCount } = useNotifications();

  return (
    <button
      onClick={onClick}
      className="text-text-colour hover:bg-gray-bg hover:text-heading-colour relative rounded-full p-2 transition-colors"
      aria-label="Open notifications"
    >
      <Bell size={20} />
      {unreadCount > 0 && (
        <span className="bg-theme-green-dark absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full text-xs font-bold text-white">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </button>
  );
}
