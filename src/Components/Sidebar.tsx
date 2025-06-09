import { NavLink } from "react-router-dom";
import { Home, Bell, Mail, Settings, User } from "react-feather";
import LogOutButton from "./home_page/LogOutButton";
import { useAuth } from "./AuthContext";

interface NavItem {
  to: string;
  label: string;
  Icon: React.ComponentType<{ size?: number }>;
}
interface SidebarProps {
  onComposeClick: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onComposeClick }) => {
  const { user, isReady, profile } = useAuth();

  if (!isReady) return <div className="p-4">Loading sidebar…</div>;
  if (!user || !profile)
    return <div className="p-4">Sidebar not available…</div>;

  const avatarSrc = profile.profile_image || "/default.jpg";
  const display_name = profile.name || `${user.first_name} ${user.last_name}`;

  const navItems: NavItem[] = [
    { to: "/home", label: "Home", Icon: Home },
    // { to: "", label: "Notifications", Icon: Bell },
    // { to: "", label: "Messages", Icon: Mail },
    { to: "/settings", label: "Settings", Icon: Settings },
    { to: `/${user.username}`, label: "Profile", Icon: User },
  ];

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
      <div className="mt-auto flex- items-center space-x-3 hover:bg-gray-800 p-2 rounded-full transition cursor-pointer">
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
