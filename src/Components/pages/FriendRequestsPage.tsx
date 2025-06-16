import React, { useMemo, useState } from "react";
import {
  acceptFriendRequest,
  rejectFriendRequest,
  cancelFriendRequest,
} from "../../api";
import {
  useFriendRequests,
  FriendRequest,
} from "../../contexts/FriendRequestsContext";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

type Tab = "Received" | "Sent";

const FriendRequestsPage: React.FC = () => {
  const { sent, received } = useFriendRequests();
  const [activeTab, setActiveTab] = useState<Tab>("Received");

  const renderItem = (req: FriendRequest, type: Tab) => {
    const user =
      type === "Received"
        ? { username: req.from_username, avatar: req.from_avatar }
        : { username: req.to_username, avatar: req.to_avatar };

    return (
      <motion.li
        key={req.id}
        layout
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -10 }}
        transition={{ duration: 0.2 }}
        className="bg-gray-800 p-4 rounded flex justify-between items-center"
      >
        <Link to={`/${user.username}`} className="flex items-center space-x-3">
          <img
            src={user.avatar || "/default-avatar.png"}
            alt={user.username}
            className="w-10 h-10 rounded-full object-cover"
          />
          <span className="text-white">@{user.username}</span>
        </Link>

        {type === "Received" ? (
          <div className="space-x-2">
            <button
              onClick={() => acceptFriendRequest(req.id)}
              className="px-3 py-1 bg-green-600 text-white rounded"
            >
              Accept
            </button>
            <button
              onClick={() => rejectFriendRequest(req.id)}
              className="px-3 py-1 bg-red-600 text-white rounded"
            >
              Reject
            </button>
          </div>
        ) : (
          <button
            onClick={() => cancelFriendRequest(req.id)}
            className="px-3 py-1 bg-gray-600 text-white rounded"
          >
            Cancel
          </button>
        )}
      </motion.li>
    );
  };

  const visibleList = useMemo(() => {
    return activeTab === "Received" ? received : sent;
  }, [activeTab, received, sent]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-4">Friend Requests</h1>

      <div className="flex border-b mb-4">
        {(["Received", "Sent"] as Tab[]).map((tab) => (
          <button
            key={tab}
            className={`flex-1 py-2 text-center ${
              activeTab === tab
                ? "border-b-2 border-blue-500 font-bold"
                : "text-gray-400"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <section>
        {visibleList.length === 0 ? (
          <p className="text-gray-500">
            No {activeTab.toLowerCase()} friend requests.
          </p>
        ) : (
          <motion.ul layout className="space-y-3">
            <AnimatePresence>
              {visibleList.map((req) => renderItem(req, activeTab))}
            </AnimatePresence>
          </motion.ul>
        )}
      </section>
    </div>
  );
};

export default FriendRequestsPage;
