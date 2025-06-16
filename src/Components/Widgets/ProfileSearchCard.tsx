import React from "react";
import { UserProfile } from "../../contexts/types";

const ProfileSearchCard: React.FC<{ profile: UserProfile }> = ({ profile }) => {
  const displayName = profile.name || profile.username;
  const handle = profile.username;

  return (
    <div
      className="
        flex 
        items-center 
        w-full 
        px-4 py-2
        text-white 
        no-underline 
        hover:bg-gray-800 
        rounded-lg
        cursor-pointer
      "
    >
      <img
        src={profile.profile_image}
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
    </div>
  );
};

export default ProfileSearchCard;
