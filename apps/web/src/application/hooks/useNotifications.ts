import { useEffect, useState, useCallback } from "react";
import { io } from "socket.io-client";
import { useSelector } from "react-redux";
import { getNotifications, getUnreadCount, markAsRead, deleteAllNotifications, type NotificationDTO } from "@/infrastructure/api/notification.api";

const SOCKET_SERVER_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<NotificationDTO[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Get current user ID from Redux with fallback to local storage
  const authState = useSelector((state: any) => state.auth);
  const persistedRole = authState.persistedRole || (typeof window !== "undefined" ? localStorage.getItem("medixflow_user_role") : null);
  const user = persistedRole ? authState[persistedRole]?.user : null;
  const userId = user?.id;
  
  const fetchInitialData = useCallback(async () => {
    if (!userId) {
      return;
    }
    try {
      const [notifs, count] = await Promise.all([
        getNotifications(10, 0),
        getUnreadCount()
      ]);
      setNotifications(notifs);
      setUnreadCount(count);
    } catch (error) {
      console.error("[useNotifications] Failed to fetch notifications:", error);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    fetchInitialData();

    const newSocket = io(SOCKET_SERVER_URL, {
      query: { userId },
      withCredentials: true,
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5,
    });

    newSocket.on("connect", () => {
      console.log("Socket connected successfully:", newSocket.id);
    });

    newSocket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    newSocket.on("notification_received", (notification: NotificationDTO) => {
      console.log("Notification received:", notification);
      setNotifications((prev) => [notification, ...prev.slice(0, 9)]);
    });

    newSocket.on("unread_count_updated", ({ count }: { count: number }) => {
      console.log("Unread count updated:", count);
      setUnreadCount(count);
    });

    return () => {
      console.log("Disconnecting socket...");
      newSocket.disconnect();
    };
  }, [userId, fetchInitialData]);

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
      // Unread count will be updated via socket event from backend
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
    refresh: fetchInitialData
  };
};
