import { GrLogout } from "react-icons/gr";
import { useAuth } from "../AuthContext";

const LogOutButton = () => {
  const { signOut } = useAuth();
  const handleLogOut = () => {
    signOut();
  };
  return (
    <button onClick={handleLogOut}>
      <GrLogout />
    </button>
  );
};

export default LogOutButton;
