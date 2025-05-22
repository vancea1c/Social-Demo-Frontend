import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./Components/AuthContext";
import ProtectedRoute from "./hoc/ProtectedRoute";

import Greeting_page from "./Components/pages/Greeting_page";
import SignIn_page from "./Components/pages/SignIn_page";
import SignUpPage from "./Components/pages/SignUpPage";
import ForgotPwPage from "./Components/pages/ForgotPwPage";

import TestingPage from "./Components/pages/TestingPage";

import Layout from "./Components/Layout";
import HomePage from "./Components/pages/HomePage";
import { FeedRefreshProvider } from "./contexts/FeedRefreshContext";
import { PostSyncProvider } from "./contexts/PostSyncContext";
import ProfilePage from "./Components/ProfilePage";

import PostDetail from "./Components/pages/PostDetail";
function App() {
  return (
    <>
      <AuthProvider>
        <PostSyncProvider>
          <FeedRefreshProvider>
            <Routes>
              {/* 1. Static public routes */}
              <Route path="/" element={<Greeting_page />} />
              <Route path="/sign_up" element={<SignUpPage />} />
              <Route path="/log_in" element={<SignIn_page />} />
              <Route path="/forgot_password" element={<ForgotPwPage />}></Route>
              <Route path="/testing" element={<TestingPage />}></Route>

              {/* 2. All authenticated pages share the same Layout/Sidebar */}
              <Route
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                {/* 2a. Your feed still lives at /home */}
                <Route path="/home" element={<HomePage />} />
                <Route path="/:username/posts/:id" element={<PostDetail />} />

                {/* 2b. NEW: Catch-all username route at root */}
                <Route path="/:username" element={<ProfilePage />} />
              </Route>

              {/* 3. Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </FeedRefreshProvider>
        </PostSyncProvider>
      </AuthProvider>
    </>
  );
}

export default App;
