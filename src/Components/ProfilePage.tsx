import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { useParams } from "react-router-dom";
import { useAuth } from "../Components/AuthContext";
import api from "../api";
import EditProfileForm from "./Widgets/EditProfileForm";
import { UserProfile } from "../contexts/types";
import { Calendar } from "react-feather";

const ProfilePage: React.FC = () => {
  const { username: paramUsername } = useParams<{ username: string }>();
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);

  const isOwner = user?.username === paramUsername;

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const endpoint = isOwner ? "profile/me/" : `profile/${paramUsername}/`;
        const res = await api.get<UserProfile>(endpoint);
        setProfile(res.data);
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };
    if (paramUsername) fetchProfile();
  }, [paramUsername, isOwner]);

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
        {/* TODO: afișează postările utilizatorului */}
      </div>

      {/* Modal Edit */}
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
