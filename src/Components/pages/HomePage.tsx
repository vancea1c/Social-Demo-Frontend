import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";
import LogOutButton from "../home_page/LogOutButton";
import Sidebar from "../Sidebar";
const HomePage = () => {
  return (
    <div>
      <h1 id="logo">Social</h1>
      <Sidebar></Sidebar>
    </div>
  );
};

export default HomePage;
