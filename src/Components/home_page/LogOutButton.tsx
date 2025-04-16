import React from "react";
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";

const LogOutButton = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const handleLogOut = () => {
    signOut;
    navigate("/");
  };
  return <button onClick={handleLogOut}>Log Out</button>;
};

export default LogOutButton;
