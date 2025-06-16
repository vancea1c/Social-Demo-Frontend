import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { useParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { usePostSyncContext } from "../../contexts/PostSyncContext";
import { useFriendRequests } from "../../contexts/FriendRequestsContext";
import { useUserProfiles } from "../../contexts/UserProfilesContext";
import { usePageTitle } from "../../contexts/PageTitleContext";
import {
  fetchLikedPosts,
  sendFriendRequest,
  cancelFriendRequest,
  removeFriend,
  acceptFriendRequest,
  rejectFriendRequest,
} from "../../api";
import EditProfileForm from "../Widgets/EditProfileForm";
import { UserProfile } from "../../contexts/types";
import { Calendar } from "react-feather";
import { fetchUserPosts } from "../../api";
import Post, { PostProps } from "../Feed/Post2";
import { motion } from "framer-motion";

const sortByDate = (a: PostProps, b: PostProps) =>
  new Date(b.created_at).getTime() - new Date(a.created_at).getTime();

const ProfilePage: React.FC = () => {
  const { username: paramUsername } = useParams<{ username: string }>();
  const {
    user,
    token,
    isReady,
    profile: authProfile,
    updateProfile: updateAuthProfile,
  } = useAuth();
  const {
    profiles,
    fetchProfile,
    updateProfile: updateUserProfileContext,
  } = useUserProfiles();
  const { state, replaceWithProfile, replaceWithLikes } = usePostSyncContext();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const isOwner = user?.username === paramUsername;
  type Tab = "Posts" | "Likes";
  const [activeTab, setActiveTab] = useState<Tab>("Posts");
  usePageTitle(`${paramUsername}`);
  const { sent, received } = useFriendRequests();
  const existingRequest = sent.find((req) => req.to_username === paramUsername);
  const incomingRequest = received.find(
    (r) => r.from_username === paramUsername
  );
  const isFriend = profile?.are_friends;
  console.log(isFriend, "isFriend");

  useEffect(() => {
    let cancelled = false;
    if (!paramUsername) return;
    setLoading(true);

    (async () => {
      try {
        let prof: UserProfile;

        if (isOwner) {
          prof = authProfile!;
        } else if (profiles[paramUsername]) {
          prof = profiles[paramUsername];
        } else {
          prof = await fetchProfile(paramUsername);
          if (!cancelled) {
            updateUserProfileContext(prof);
          }
        }
        if (!cancelled) {
          setProfile(prof);
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [
    paramUsername,
    isOwner,
    authProfile,
    profiles,
    fetchProfile,
    updateUserProfileContext,
  ]);

  useEffect(() => {
    let cancelled = false;
    if (activeTab !== "Posts" || !paramUsername) return;

    (async () => {
      try {
        const data = await fetchUserPosts(paramUsername);
        const allPosts: PostProps[] = Array.isArray(data)
          ? data
          : data.results ?? [];

        const links: Record<number, number[]> = {};
        allPosts.forEach((p) => {
          if (p.parent != null) {
            links[p.parent] = [...(links[p.parent] || []), p.id];
          }
        });
        if (!cancelled) {
          replaceWithProfile(allPosts, links);
        }
      } catch (err) {
        console.error("Error fetching user posts:", err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [paramUsername, activeTab, replaceWithProfile]);

  useEffect(() => {
    let cancelled = false;
    if (activeTab !== "Likes" || !token) return;
    (async () => {
      try {
        const data = await fetchLikedPosts();
        const likedPosts: PostProps[] = Array.isArray(data)
          ? data
          : data.results ?? [];
        if (!cancelled) {
          replaceWithLikes(likedPosts);
        }
      } catch (err) {
        console.error("Error fetching liked posts:", err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activeTab, replaceWithLikes, token]);

  if (loading || !isReady) return <div>Loading...</div>;
  if (!profile) return <div>Profile not found</div>;
  const posts = Object.values(state.posts)
    .filter((p) => p.username === paramUsername)
    .sort(sortByDate);
  const liked = Object.values(state.liked);

  const handleFriendRequest = async () => {
    if (!profile) return;
    try {
      await sendFriendRequest(profile.username);
    } catch (err) {
      console.error("Error sending friend request:", err);
    }
  };

  const handleRemoveFriend = async () => {
    try {
      await removeFriend(profile!.username);
      setProfile((prev) => (prev ? { ...prev, are_friends: false } : prev));
    } catch (err) {
      console.error("Failed to remove friend:", err);
    }
  };

  const handleCancelRequest = async (requestId: number) => {
    try {
      await cancelFriendRequest(requestId);
    } catch (err) {
      console.error("Failed to cancel friend request:", err);
    }
  };
  const handleUpdate = (updated: UserProfile) => {
    setProfile(updated);
    if (isOwner) {
      updateAuthProfile(updated);
    }
    updateUserProfileContext(updated);
  };

  const joinedDate = profile.date_joined ? new Date(profile.date_joined) : null;
  const feedToRender = activeTab === "Posts" ? posts : liked;
  return (
    <div className="profile-page">
      <div
        className="relative h-60 rounded-t-lg overflow-hidden
    bg-gray-700"
      >
        {profile.cover_image && (
          <img
            src={profile.cover_image}
            className="object-cover w-full h-full"
            alt="Cover"
          />
        )}
      </div>

      <div className="header">
        <img
          className="avatar"
          src={profile.profile_image}
          alt={profile.name}
        />
        <h1>{profile.name}</h1>
        <p className="username">@{profile.username}</p>
        {profile.bio && <p className="bio">{profile.bio}</p>}

        <div className="stats">
          <span className="flex items-center space-x-1">
            <Calendar size={16} />
            {joinedDate !== null && (
              <span>
                Joined{" "}
                {joinedDate.toLocaleDateString(undefined, {
                  month: "long",
                  year: "numeric",
                })}
              </span>
            )}
          </span>
          <motion.span
            key={profile.friends_count}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.3 }}
          >
            {profile.friends_count}{" "}
            {profile.friends_count === 1 ? "Friend" : "Friends"}
          </motion.span>
        </div>

        <p className="capitalize">{profile.gender}</p>

        <div>
          {isOwner ? (
            <button onClick={() => setShowEditModal(true)}>Edit Profile</button>
          ) : isFriend ? (
            <button
              onClick={handleRemoveFriend}
              className="bg-red-600 text-white px-4 py-2 rounded"
            >
              Remove Friend
            </button>
          ) : incomingRequest ? (
            <div className="flex gap-2">
              <button
                className="bg-green-600 text-white px-4 py-2 rounded"
                onClick={() => acceptFriendRequest(incomingRequest.id)}
              >
                Accept Friend Request
              </button>
              <button
                className="bg-red-600 text-white px-4 py-2 rounded"
                onClick={() => rejectFriendRequest(incomingRequest.id)}
              >
                Reject
              </button>
            </div>
          ) : existingRequest ? (
            <div className="flex items-center justify-center  space-x-5">
              <h2 className="text-[20px]">Friend request sent</h2>
              <button
                onClick={() => handleCancelRequest(existingRequest.id)}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Cancel Request
              </button>
            </div>
          ) : (
            <button
              onClick={handleFriendRequest}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Add Friend
            </button>
          )}
        </div>
      </div>
      {isOwner && (
        <div className="flex border-b mb-4">
          <button
            className={`flex-1 py-2 text-center ${
              activeTab === "Posts"
                ? "border-b-2 border-blue-500 font-bold"
                : "text-gray-600"
            }`}
            onClick={() => setActiveTab("Posts")}
          >
            Posts
          </button>
          <button
            className={`flex-1 py-2 text-center ${
              activeTab === "Likes"
                ? "border-b-2 border-blue-500 font-bold"
                : "text-gray-600"
            }`}
            onClick={() => setActiveTab("Likes")}
          >
            Likes
          </button>
        </div>
      )}

      <div className="posts-feed">
        {profile.is_private && !isOwner && !isFriend ? (
          <div className="text-gray-500 p-4">This profile is on private.</div>
        ) : feedToRender.length === 0 ? (
          <div className="text-gray-500 p-4">
            {activeTab === "Posts" ? "No posts yet." : "No liked posts yet."}
          </div>
        ) : (
          feedToRender
            .filter(
              (p): p is PostProps =>
                p.type !== "reply" && typeof p.id === "number"
            )
            .map((p) => <Post key={`${p.type}-${p.id}`} {...p} />)
        )}
      </div>
      {showEditModal &&
        ReactDOM.createPortal(
          <EditProfileForm
            initialData={profile}
            onClose={() => setShowEditModal(false)}
            onSave={handleUpdate}
          />,
          document.body
        )}
    </div>
  );
};

export default ProfilePage;
