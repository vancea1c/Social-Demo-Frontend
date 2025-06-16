// contexts/NotificationsContext.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useAuth } from "./AuthContext";
import {
  fetchNotifications,
  fetchUnreadCount,
  markAllNotificationsRead,
  toggleNotificationRead,
} from "../api"; // ← your API helpers
import { useWebsocket } from "./WebSocketContext";

export type Notification = {
  id: number;
  actor: string;
  actor_avatar: string | null;
  notification_type: string;
  message: string;
  target_type: string;
  target_id: number;
  parent_post_id: number | null;
  target_url: string | null;
  created_at: string;
  is_read: boolean;
  active: boolean;
};

type NotificationContextValue = {
  notifications: Notification[];
  unreadCount: number;
  markAllRead: () => Promise<void>;
  toggleRead: (id: number) => Promise<void>;
};

const NotificationsContext = createContext<
  NotificationContextValue | undefined
>(undefined);

export const NotificationsProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { token } = useAuth();
  const { subscribe, unsubscribe } = useWebsocket();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!token) return;

    fetchNotifications(1).then((data) => {
      const active = data.results.filter((n) => n.active);
      setNotifications(active);
    });
    fetchUnreadCount().then(({ unread }) => {
      setUnreadCount(unread);
    });
  }, [token]);


  useEffect(() => {
    const handleNew = (incoming: Notification) => {
      setNotifications((prev) => {
        const exists = prev.find((n) => n.id === incoming.id);
        const merged = exists
          ? prev.map((n) => (n.id === incoming.id ? incoming : n))
          : [...prev, incoming];

        const activeSorted = merged
          .filter((n) => n.active)
          .sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
          );

        setUnreadCount(activeSorted.filter((n) => !n.is_read).length);
        return activeSorted;
      });
    };

    const handleDelete = (data: { id: number }) => {
      setNotifications((prev) => {
        const existing = prev.find((n) => n.id === data.id);
        if (!existing) return prev;

        const updated = prev.filter((n) => n.id !== data.id);
        if (!existing.is_read) {
          setUnreadCount((count) => Math.max(0, count - 1));
        }
        return updated;
      });
    };

    subscribe("notification_message", handleNew);
    subscribe("notification_delete", handleDelete);

    return () => {
      unsubscribe("notification_message", handleNew);
      unsubscribe("notification_delete", handleDelete);
    };
  }, [subscribe, unsubscribe]);

  const markAllRead = async () => {
    const { marked } = await markAllNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  const toggleRead = async (id: number) => {
    const updated = await toggleNotificationRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? updated : n)));
    setUnreadCount((prev) => prev + (updated.is_read ? -1 : 1));
  };

  return (
    <NotificationsContext.Provider
      value={{ notifications, unreadCount, markAllRead, toggleRead }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationsContext);
  if (!ctx)
    throw new Error(
      "useNotifications must be used inside NotificationsProvider"
    );
  return ctx;
};
