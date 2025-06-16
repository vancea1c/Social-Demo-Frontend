import React from "react";
import { Link } from "react-router-dom";
import { useNotifications } from "../../contexts/NotificationsContext";
import { usePageTitle } from "../../contexts/PageTitleContext";
import { motion, AnimatePresence } from "framer-motion";

const NotificationPage: React.FC = () => {
  const { notifications, unreadCount, markAllRead, toggleRead } =
    useNotifications();

  const POST_TYPES = ["new_post", "post_like", "post_repost", "post_quote"];
  const COMMENT_TYPES = ["post_comment", "comment_like", "comment_reply"];

  const isPostNotification = (type: string) => POST_TYPES.includes(type);
  const isCommentNotification = (type: string) => COMMENT_TYPES.includes(type);

  usePageTitle(`Notifications (${unreadCount} unread)`);

  return (
    <div className="p-4">
      <button
        className="mb-4 px-3 py-1 rounded bg-blue-500 text-white"
        onClick={markAllRead}
      >
        Mark all as read
      </button>

      <motion.ul layout className="space-y-2">
        <AnimatePresence>
          {notifications.map((n) => (
            <motion.li
              key={n.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className={`border p-2 rounded ${
                n.is_read ? "bg-gray-800" : "bg-red-400"
              }`}
            >
              <div className="flex items-center">
                {n.actor_avatar && (
                  <img
                    src={n.actor_avatar}
                    alt="avatar"
                    className="w-8 h-8 rounded-full mr-2"
                  />
                )}
                <div className="flex-1">
                  <p>{n.message}</p>
                  <small className="text-sm text-gray-300">
                    {new Date(n.created_at).toLocaleString()}
                  </small>
                </div>
                <button
                  onClick={() => toggleRead(n.id)}
                  className="ml-2 text-sm underline"
                >
                  {n.is_read ? "Mark unread" : "Mark read"}
                </button>
              </div>

              {/* View link */}
              {isPostNotification(n.notification_type) ? (
                <Link
                  to={`/${n.actor}/posts/${n.target_id}`}
                  className="text-blue-400 text-sm"
                >
                  View Post
                </Link>
              ) : isCommentNotification(n.notification_type) ? (
                <Link
                  to={`/${n.actor}/posts/${n.parent_post_id}`}
                  className="text-blue-400 text-sm"
                >
                  View Comment
                </Link>
              ) : null}
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>
    </div>
  );
};

export default NotificationPage;
