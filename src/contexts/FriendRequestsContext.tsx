import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useAuth } from "./AuthContext";
import { useWebsocket } from "./WebSocketContext";
import { fetchFriendRequests } from "../api";
import { useUserProfiles } from "./UserProfilesContext";

export interface FriendRequest {
  id: number;
  from_user: number;
  to_user: number;
  from_username: string;
  to_username: string;
  from_avatar: string;
  to_avatar: string;
  created_at: string;
}

type ContextValue = {
  sent: FriendRequest[];
  received: FriendRequest[];
};

const FriendRequestsContext = createContext<ContextValue | null>(null);

export const FriendRequestsProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { token, user } = useAuth();
  const { subscribe, unsubscribe } = useWebsocket();
  const [sent, setSent] = useState<FriendRequest[]>([]);
  const [received, setReceived] = useState<FriendRequest[]>([]);
  const { fetchProfile, updateProfile } = useUserProfiles();

  useEffect(() => {
    if (!token) return;
    fetchFriendRequests().then(({ sent, received }) => {
      setSent(sent);
      setReceived(received);
    });
  }, [token]);

  useEffect(() => {
    if (!user?.id) return;

    const handleEvent = (data: any) => {
      const { id, type } = data;
      console.log("[WS friend] Got", data);

      setSent((prev) => {
        if (
          type === "new" &&
          data.from_username === user.username &&
          !prev.some((r) => r.id === id)
        ) {
          return [...prev, data];
        }
        if (["accepted", "rejected", "cancelled"].includes(type)) {
          return prev.filter((r) => r.id !== id);
        }
        return prev;
      });

      setReceived((prev) => {
        if (
          type === "new" &&
          data.to_username === user.username &&
          !prev.some((r) => r.id === id)
        ) {
          return [...prev, data];
        }
        if (["accepted", "rejected", "cancelled", "removed"].includes(type)) {
          return prev.filter((r) => r.id !== id);
        }
        return prev;
      });
      if (type === "accepted" || type === "removed") {
        const friendUsername =
          data.from_username === user.username
            ? data.to_username
            : data.from_username;

        fetchProfile(friendUsername).then(updateProfile);
      }
    };

    console.log("🔔 Subscribing to friend_request for", user.id);
    subscribe("friend_request", handleEvent);

    return () => {
      unsubscribe("friend_request", handleEvent);
    };
  }, [subscribe, unsubscribe, user?.username]);

  return (
    <FriendRequestsContext.Provider value={{ sent, received }}>
      {children}
    </FriendRequestsContext.Provider>
  );
};

export const useFriendRequests = () => {
  const ctx = useContext(FriendRequestsContext);
  if (!ctx)
    throw new Error(
      "useFriendRequests must be used inside a FriendRequestsProvider"
    );
  return ctx;
};
