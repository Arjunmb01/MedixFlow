import { useEffect, useState, useCallback, useRef } from "react";
import { io, type Socket } from "socket.io-client";
import { useSelector } from "react-redux";
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  deleteAllNotifications,
  type NotificationDTO,
} from "@/infrastructure/api/notification.api";
import type { RootState } from "@/core/store/store";

const SOCKET_SERVER_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

interface UseNotificationsOptions {
  /** When false, skips Socket.IO (still loads unread count for badge). */
  enableSocket?: boolean;
}

export const useNotifications = (options: UseNotificationsOptions = {}) => {
  const { enableSocket = true } = options;
  const [notifications, setNotifications] = useState<NotificationDTO[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const socketRef = useRef<Socket | null>(null);

  const authState = useSelector((state: RootState) => state.auth);
  const persistedRole = authState.persistedRole;
  const user = persistedRole ? authState[persistedRole]?.user : null;
  const userId = user?.id;

  const fetchInitialData = useCallback(async () => {
    if (!userId) return;
    try {
      if (enableSocket) {
        const [response, count] = await Promise.all([
          getNotifications(10, 0),
          getUnreadCount(),
        ]);
        const notifs = Array.isArray(response) ? response : (response?.data || []);
        setNotifications(notifs);
        setUnreadCount(count);
      } else {
        const count = await getUnreadCount();
        setUnreadCount(count);
      }
    } catch (error) {
      console.error("[useNotifications] Failed to fetch notifications:", error);
    }
  }, [userId, enableSocket]);

  useEffect(() => {
    if (!userId) return;
    void fetchInitialData();
  }, [userId, fetchInitialData]);

  useEffect(() => {
    if (!userId || !enableSocket) return;

    const newSocket = io(SOCKET_SERVER_URL, {
      query: { userId },
      withCredentials: true,
      transports: ["websocket"],
      reconnectionAttempts: 5,
    });

    socketRef.current = newSocket;

    newSocket.on("notification_received", (notification: NotificationDTO) => {
      setNotifications((prev) => [notification, ...prev.slice(0, 9)]);
    });

    newSocket.on("unread_count_updated", ({ count }: { count: number }) => {
      setUnreadCount(count);
    });

    return () => {
      newSocket.disconnect();
      socketRef.current = null;
    };
  }, [userId, enableSocket]);

  const handleMarkAsRead = async (id?: string) => {
    try {
      await markAsRead(id);
      if (id) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        );
      } else {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      }
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const handleClearAll = async () => {
    try {
      await deleteAllNotifications();
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to clear notifications:", error);
    }
  };

  return {
    notifications,
    unreadCount,
    markAsRead: handleMarkAsRead,
    clearAll: handleClearAll,
    refresh: fetchInitialData,
  };
};
