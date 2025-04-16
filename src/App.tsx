import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./Components/AuthContext";
import Greeting_page from "./Components/pages/Greeting_page";
import SignIn_page from "./Components/pages/SignIn_page";
import SignUpPage from "./Components/pages/SignUpPage";
import HomePage from "./Components/pages/HomePage";
import ProtectedRoute from "./hoc/ProtectedRoute";
import "./App.css";
import ForgotPwPage from "./Components/pages/ForgotPwPage";
import TestingPage from "./Components/pages/TestingPage";

function App() {
  return (
    <>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Greeting_page />} />
          <Route path="/sign_up" element={<SignUpPage />} />
          <Route path="/log_in" element={<SignIn_page />} />
          <Route path="/forgot_password" element={<ForgotPwPage />}></Route>
          <Route path="/testing" element={<TestingPage />}></Route>

          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </>
  );
}

export default App;
