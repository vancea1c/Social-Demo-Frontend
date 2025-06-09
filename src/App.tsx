import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./Components/AuthContext";
import { PostSyncProvider } from "./contexts/PostSyncContext";
import { UserProfilesProvider } from "./contexts/UserProfilesContext";
import { PageTitleProvider } from "./contexts/PageTitleContext";
import ProtectedRoute from "./hoc/ProtectedRoute";

import Greeting_page from "./Components/pages/Greeting_page";
import SignIn_page from "./Components/pages/SignIn_page";
import SignUpPage from "./Components/pages/SignUpPage";
import ForgotPwPage from "./Components/pages/ForgotPwPage";
import ProfilePage from "./Components/pages/ProfilePage";
import PostDetail from "./Components/pages/PostDetail";
import HomePage from "./Components/pages/HomePage";
import TestingPage from "./Components/pages/TestingPage";
import SettingsPage from "./Components/pages/SettingsPage";
import ChangeYPwPage from "./Components/pages/ChangeYPwPage";
import Goodbye from "./Components/pages/Goodbye";

import Layout from "./Components/Layout";
function App() {
  return (
    <>
      <AuthProvider>
        <UserProfilesProvider>
          <PostSyncProvider>
            <Routes>
              {/* 1. Static public routes */}
              <Route path="/" element={<Greeting_page />} />
              <Route path="/sign_up" element={<SignUpPage />} />
              <Route path="/log_in" element={<SignIn_page />} />
              <Route path="/forgot_password" element={<ForgotPwPage />}></Route>
              <Route path="/testing" element={<TestingPage />}></Route>
              <Route path="/goodbye" element={<Goodbye />} />

              {/* 2. All authenticated pages share the same Layout/Sidebar */}
              <Route
                element={
                  <ProtectedRoute>
                    <PageTitleProvider>
                      <Layout />
                    </PageTitleProvider>
                  </ProtectedRoute>
                }
              >
                {/* 2a. Your feed still lives at /home */}
                <Route path="/home" element={<HomePage />} />
                <Route path="/:username/posts/:id" element={<PostDetail />} />

                {/* 2b. NEW: Catch-all username route at root */}
                <Route path="/:username" element={<ProfilePage />} />
                <Route path="/settings" element={<SettingsPage />} />

                <Route
                  path="/change_your_password"
                  element={<ChangeYPwPage />}
                />
              </Route>

              {/* 3. Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </PostSyncProvider>
        </UserProfilesProvider>
      </AuthProvider>
    </>
  );
}

export default App;
