import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";
import LogOutButton from "../home_page/LogOutButton";
const HomePage = () => {
  return (
    <div>
      <h1 id="logo">Social</h1>
      <LogOutButton></LogOutButton>
    </div>
  );
};

export default HomePage;
