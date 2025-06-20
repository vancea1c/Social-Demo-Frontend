import { useMemo } from "react";
import { usePostSyncContext } from "../contexts/PostSyncContext";
import { useAuth } from "../contexts/AuthContext";
import { useUserProfiles } from "../contexts/UserProfilesContext";
import type { PostProps } from "../Components/Feed/Post2";
import type { UserProfile } from "../contexts/types";

export function useFilteredFeed(): PostProps[] {
  const { state } = usePostSyncContext();
  const { user, profile: myProfile } = useAuth();
  const { profiles } = useUserProfiles();

  const filtered = useMemo(() => {
    if (!user) return [];

    return Object.values(state.posts).filter((p) => {
      if (p.type === "reply") {
        return false;
      }
      const isMe = p.username === user.username;
      const authorProfile: UserProfile | undefined = isMe? (myProfile ?? undefined): profiles[p.username];
      if (authorProfile?.is_private && !authorProfile.are_friends && !isMe) {
        return false;
      }
      return true;
    });
  }, [state.posts, user, myProfile, profiles]);

  return filtered;
}
