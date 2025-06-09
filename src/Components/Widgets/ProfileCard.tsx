import React from "react";
import { AuthUser, UserProfile } from "../../contexts/types";

export interface Profile {
  user: AuthUser;
  profile: UserProfile;
}

const ProfileCard: React.FC<{ profile: Profile }> = ({ profile }) => {
  const displayName = profile.profile.name || profile.user.username;
  const handle = profile.user.username;

  return (
    <a
      href={`/profile/${handle}`}
      className="
        flex 
        items-center 
        w-full 
        p-2 
        text-white 
        no-underline 
        hover:bg-gray-800 
        rounded-lg
      "
    >
      <img
        src={profile.profile.profile_image}
        alt={displayName}
        className="w-12 h-12 rounded-full object-cover flex-shrink-0"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src =
            "https://via.placeholder.com/48?text=User";
        }}
      />

      <div className="ml-3 overflow-hidden">
        <div className="text-base font-semibold truncate">{displayName}</div>
        <div className="text-sm text-gray-400 truncate mt-0.5">@{handle}</div>
      </div>
    </a>
  );
};

export default ProfileCard;
