import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { useParams } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { usePostSyncContext } from "../../contexts/PostSyncContext";
import { useUserProfiles } from "../../contexts/UserProfilesContext";
import api from "../../api";
import EditProfileForm from "../Widgets/EditProfileForm";
import { UserProfile } from "../../contexts/types";
import { Calendar } from "react-feather";
import { fetchUserPosts } from "../../api";
import Post, { PostProps } from "../Feed/Post2";

const sortByDate = (a: PostProps, b: PostProps) =>
  new Date(b.created_at).getTime() - new Date(a.created_at).getTime();

const ProfilePage: React.FC = () => {
  const { username: paramUsername } = useParams<{ username: string }>();
  const { user, updateProfile: updateAuthProfile } = useAuth();
  const { fetchProfile, updateProfile } = useUserProfiles();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const isOwner = user?.username === paramUsername;
  const { state, replaceWithProfile } = usePostSyncContext();

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const endpoint = isOwner ? "profile/me/" : `profile/${paramUsername}/`;
        const res = await api.get<UserProfile>(endpoint);
        setProfile(res.data);
        updateProfile(res.data);
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };
    if (paramUsername) fetchProfile();
  }, [paramUsername, isOwner]);

  useEffect(() => {
    if (!paramUsername) return;
    fetchUserPosts(paramUsername)
      .then((data) => {
        const postsList: PostProps[] = Array.isArray(data)
          ? data
          : data.results ?? [];

        const links: Record<number, number[]> = {};
        postsList.forEach((p) => {
          if (p.parent != null) {
            links[p.parent] = [...(links[p.parent] || []), p.id];
          }
        });
        replaceWithProfile(postsList, links);
      })
      .catch((err) => {
        console.error("Error fetching user posts:", err);
      });
  }, [paramUsername]);

  const posts = Object.values(state.posts).sort(sortByDate);

  const handleFriendRequest = async () => {
    if (!profile) return;
    try {
      await api.post("friend-requests/", { to_user: profile.username });
      // opțional: actualizează un state cu status-ul cererii
    } catch (err) {
      console.error("Error sending friend request:", err);
    }
  };

  const handleUpdate = (updated: UserProfile) => {
    console.log("PROFILE UPDATED", updated);
    setProfile(updated);
  };

  if (loading) return <div>Loading...</div>;
  if (!profile) return <div>Profile not found</div>;
  let joinedDate: Date | null = null;
  if (profile.date_joined) {
    joinedDate = new Date(profile.date_joined);
  }

  return (
    <div className="profile-page">
      {/* Cover / Banner */}
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

      {/* Avatar & Info */}
      <div className="header">
        <img
          className="avatar"
          src={profile.profile_image}
          alt={profile.name}
        />
        <h1>{profile.name}</h1>
        <p className="username">@{profile.username}</p>
        {profile.bio && <p className="bio">{profile.bio}</p>}

        {/* Friends count */}
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
          <span>{profile.friends_count ?? 0} Friends</span>
        </div>

        <p className="capitalize">{profile.gender}</p>

        {/* Action button */}
        {isOwner ? (
          <button onClick={() => setShowEditModal(true)}>Edit Profile</button>
        ) : (
          <button onClick={handleFriendRequest}>Add Friend</button>
        )}
      </div>

      {/* Posts placeholder */}
      <div className="posts-feed">
        {posts.length === 0 ? (
          <div className="text-gray-500 p-4">No posts yet.</div>
        ) : (
          posts.map((p) =>
            p.type !== "reply" && typeof p.id === "number" ? (
              <Post key={`${p.type}-${p.id}`} {...p} />
            ) : null
          )
        )}
      </div>

      {/* Modal Edit */}
      {showEditModal &&
        ReactDOM.createPortal(
          <EditProfileForm
            initialData={profile}
            onClose={() => setShowEditModal(false)}
            onSave={(updatedProfile) => {
              handleUpdate(updatedProfile);
              if (isOwner) {
                updateAuthProfile(updatedProfile);
              }
              updateProfile(updatedProfile);
              console.log("Cached profile now:", updatedProfile.profile_image);
            }}
          />,
          document.body
        )}
    </div>
  );
};

export default ProfilePage;
