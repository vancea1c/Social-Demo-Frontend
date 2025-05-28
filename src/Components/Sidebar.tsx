import { NavLink, useNavigate } from "react-router-dom";
import { Home, Bell, Mail, Settings, User } from "react-feather";
import LogOutButton from "./home_page/LogOutButton";
import { useAuth } from "./AuthContext";
import { useUserProfiles } from "../contexts/UserProfilesContext";
import { useEffect } from "react";

interface NavItem {
  to: string;
  label: string;
  Icon: React.ComponentType<{ size?: number }>;
}
interface SidebarProps {
  onComposeClick: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onComposeClick }) => {
  const { user, loading } = useAuth();
  const { profiles, fetchProfile } = useUserProfiles();

  useEffect(() => {
    if (!loading && user) {
      fetchProfile(user.username).catch(console.error);
    }
  }, [loading, user?.username]);

  if (loading) return <div>Loading...</div>;
  if (!user) return null;
  const me = profiles[user.username];
  const avatarSrc = me?.profile_image || "/default.jpg";
  const display_name = me?.name || `${user.first_name} ${user.last_name}`;

  const navItems: NavItem[] = [
    { to: "/home", label: "Home", Icon: Home },
    { to: "/notifications", label: "Notifications", Icon: Bell },
    { to: "/messages", label: "Messages", Icon: Mail },
    { to: "/settings", label: "Settings", Icon: Settings },
    { to: `/${user.username}`, label: "Profile", Icon: User },
  ];
  console.log("Sidebar sees profiles:", profiles);

  return (
    <div>
      {/* Navigation links */}
      <ul>
        {navItems.map(({ to, label, Icon }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={to === `/${user.username}`}
              className={({ isActive }) =>
                `flex items-center space-x-2 px-3 py-2 rounded-full hover:bg-gray-800 transition ${
                  isActive ? "font-bold bg-gray-900" : ""
                }`
              }
            >
              <Icon />
              <span>{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>

      {/* Post button */}
      <button
        onClick={onComposeClick}
        className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-full transition"
      >
        Post
      </button>

      {/* Current user box with logout */}

      {/* Current user + logout */}
      <div className="mt-auto flex items-center space-x-3 hover:bg-gray-800 p-2 rounded-full transition cursor-pointer">
        <img
          className="w-10 h-10 rounded-full object-cover"
          src={avatarSrc}
          alt={`${user.first_name} ${user.last_name}`}
        />
        <div className="flex-1">
          <div className="font-semibold">{display_name}</div>
          <div className="text-gray-400">@{user.username}</div>
        </div>
        <LogOutButton />
      </div>
    </div>
  );
};

export default Sidebar;
