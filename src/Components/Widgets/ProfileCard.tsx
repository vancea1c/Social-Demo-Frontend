// src/components/Widgets/ProfileCard.tsx
import React from "react";
import { AuthUser, UserProfile } from "../../contexts/types";

export interface Profile {
  user: AuthUser;
  profile: UserProfile;
}

const ProfileCard: React.FC<{ profile: Profile }> = ({ profile }) => (
  <div style={{ display: "flex", margin: "0.5rem 0" }}>
    <img
      src={profile.profile.profile_image}
      alt={profile.profile.name}
      style={{ width: 48, height: 48, borderRadius: "50%" }}
    />
    <div style={{ marginLeft: "0.5rem" }}>
      <strong>{profile.profile.name || profile.user.username}</strong>
      <p style={{ margin: 0, fontSize: "0.9rem", color: "#aaa" }}>
        {profile.profile.bio}
      </p>
    </div>
  </div>
);

export default ProfileCard;
