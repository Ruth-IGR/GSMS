import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../api/client";
import { useAuth } from "../state/AuthContext";
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  InformationCircleIcon, 
  ExclamationTriangleIcon,
  BellIcon
} from "@heroicons/react/24/outline";

interface Notification {
  notificationId: number;
  userId: number;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  isRead: boolean;
  createdAt: string;
  relatedEntityType?: string;
  relatedEntityId?: number;
}

const Notifications = () => {
  const { user, isAuthed } = useAuth();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);

  const { data: notifications } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const { data } = await api.get<Notification[]>("/api/notifications");
      return data;
    },
    enabled: isAuthed,
    staleTime: 15000, // Consider data fresh for 15 seconds
    refetchInterval: 45000, // Poll every 45 seconds (reduced from 30)
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 404) return false; // Endpoint might not exist yet
      return failureCount < 2;
    },
  });

  const unreadCount = notifications?.filter((n) => !n.isRead).length || 0;

  const markAsRead = async (notificationId: number) => {
    try {
      await api.put(`/api/notifications/${notificationId}/read`);
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    } catch (e) {
      // Silently fail if endpoint doesn't exist
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put("/api/notifications/read-all");
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    } catch (e) {
      // Silently fail if endpoint doesn't exist
    }
  };

  if (!isAuthed) return null;

  const getNotificationIcon = (type: string) => {
    const iconClass = "h-5 w-5";
    switch (type) {
      case "success":
        return <CheckCircleIcon className={`${iconClass} text-emerald-500`} />;
      case "error":
        return <XCircleIcon className={`${iconClass} text-red-500`} />;
      case "warning":
        return <ExclamationTriangleIcon className={`${iconClass} text-amber-500`} />;
      case "info":
      default:
        return <InformationCircleIcon className={`${iconClass} text-blue-500`} />;
    }
  };

  const getNotificationBgColor = (type: string, isRead: boolean) => {
    if (isRead) return "bg-white";
    switch (type) {
      case "success":
        return "bg-emerald-50/50";
      case "error":
        return "bg-red-50/50";
      case "warning":
        return "bg-amber-50/50";
      case "info":
      default:
        return "bg-blue-50/50";
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex h-10 w-10 items-center justify-center rounded-lg text-slate-700 transition-colors hover:bg-slate-100"
      >
        <BellIcon className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-rose-500 text-xs font-bold text-white shadow-md">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-12 z-50 w-96 rounded-xl bg-white shadow-2xl ring-1 ring-slate-200 overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3">
              <div className="flex items-center gap-2">
                <BellIcon className="h-5 w-5 text-blue-600" />
                <h3 className="font-bold text-slate-900">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs font-semibold text-white">
                    {unreadCount} new
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Mark all read
                </button>
              )}
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notifications && notifications.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {notifications.map((notification) => (
                    <div
                      key={notification.notificationId}
                      className={`px-4 py-3 transition-all cursor-pointer ${getNotificationBgColor(notification.type, notification.isRead)} hover:bg-opacity-80`}
                      onClick={() => {
                        if (!notification.isRead) {
                          markAsRead(notification.notificationId);
                        }
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className={`text-sm font-semibold ${notification.isRead ? "text-slate-700" : "text-slate-900"}`}>
                              {notification.title}
                            </p>
                            {!notification.isRead && (
                              <div className="flex-shrink-0 h-2 w-2 rounded-full bg-blue-600 mt-1.5" />
                            )}
                          </div>
                          <p className="mt-1 text-sm text-slate-600 leading-relaxed">
                            {notification.message}
                          </p>
                          <p className="mt-2 text-xs text-slate-400">
                            {new Date(notification.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-12 text-center">
                  <BellIcon className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm font-medium text-slate-500">No notifications</p>
                  <p className="text-xs text-slate-400 mt-1">You're all caught up!</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Notifications;

