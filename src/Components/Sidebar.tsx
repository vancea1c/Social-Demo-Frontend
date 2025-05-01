import { NavLink, useNavigate } from "react-router-dom";
import { Home, Bell, Mail, Settings, User } from "react-feather";
import LogOutButton from "./home_page/LogOutButton";
import { useAuth } from "./AuthContext";

interface NavItem {
  to: string;
  label: string;
  Icon: React.ComponentType<{ size?: number }>;
}

const navItems: NavItem[] = [
  { to: "/home", label: "Home", Icon: Home },
  { to: "/notifications", label: "Notifications", Icon: Bell },
  { to: "/messages", label: "Messages", Icon: Mail },
  { to: "/settings", label: "Settings", Icon: Settings },
  { to: "/profile/me", label: "Profile", Icon: User },
];

const Sidebar: React.FC = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return <div>Loading...</div>;
  }
  if (!user || !profile) return null; // sau loading spinner

  const onPostClick = () => {
    navigate("/compose");
  };

  return (
    <div>
      {/* Navigation links */}
      <ul>
        {navItems.map(({ to, label, Icon }) => (
          <li key={to}>
            <NavLink to={to}>
              <Icon /> {label}
            </NavLink>
          </li>
        ))}
      </ul>

      {/* Post button */}
      <button onClick={onPostClick}>Post</button>

      {/* Current user box with logout */}
      {user && profile && (
        <div>
          <img
            src={profile.profile_image || "/default.png"}
            alt={`${user.first_name} ${user.last_name}`}
          />
          <div>{`${user.first_name} ${user.last_name}`}</div>
          <div>@{user.username}</div>
          <LogOutButton></LogOutButton>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
