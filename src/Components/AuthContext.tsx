import {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { jwtDecode } from "jwt-decode";
import api from "../api";
import { AuthUser, UserProfile } from "../contexts/types";

type DecodedJwt = { exp: number; [key: string]: any };

export type SignInCredentials = {
  identifier: string;
  password: string;
};

type AuthContextType = {
  isAuthenticated: boolean;
  token: string | null;
  isReady: boolean;
  user: AuthUser | null;
  profile: UserProfile | null;
  updateProfile: (p: UserProfile) => void;
  signIn: (credentials: SignInCredentials) => Promise<void>;
  signOut: () => void;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("accessToken");
  });
  const [user, setUser] = useState<AuthUser | null>(() =>
    JSON.parse(localStorage.getItem("user") || "null")
  );

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const updateProfile = (p: UserProfile) => {
    setProfile(p);
    localStorage.setItem("profile", JSON.stringify(p));
    console.log("%c UPDATE PROFILE AUTH:", "color: yellow;", p);
  };
  const [loading, setLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);

  const refreshTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearRefreshTimeout = () => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = null;
    }
  };
  const signOut = useCallback((redirectUrl: string = "/") => {
    setToken(null);
    setUser(null);
    setProfile(null);
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    delete api.defaults.headers.common.Authorization;
    clearRefreshTimeout();
    document.cookie =
      "access_token=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;";
    window.location.replace(redirectUrl);
  }, []);

  const doRefresh = useCallback(async () => {
    const storedRefresh = localStorage.getItem("refreshToken");

    if (!storedRefresh) {
      signOut();
      return;
    }
    try {
      const resp = await api.post(
        "token/refresh/",
        { refresh: storedRefresh },
        { withCredentials: false }
      );
      // Expected shape: { access: string, refresh?: string }
      const { access: newAccess, refresh: newRefresh } = resp.data;

      if (newAccess) {
        localStorage.setItem("accessToken", newAccess);
        setToken(newAccess);
        api.defaults.headers.common.Authorization = `Bearer ${newAccess}`;
      }
      {
        const decoded = jwtDecode(newAccess);
        if (decoded.exp) {
          const expires = new Date(decoded.exp * 1000).toUTCString();
          document.cookie = `access_token=${newAccess};expires=${expires};path=/;`;
        } else {
          document.cookie = `access_token=${newAccess};path=/;`;
        }
      }

      if (newRefresh) {
        localStorage.setItem("refreshToken", newRefresh);
      }
    } catch (err) {
      console.log("%c PROBLEM HERE ", "color: red;");
      console.log(err);
      signOut();
    }
  }, [signOut]);

  const scheduleRefresh = useCallback(() => {
    clearRefreshTimeout();

    if (!token) {
      return;
    }

    let decoded: DecodedJwt;
    try {
      // jwt_decode returns an object; we only care about exp (UNIX time in seconds)
      decoded = jwtDecode(token);
    } catch {
      // If decoding fails, just bail out
      return;
    }

    if (!decoded.exp) {
      return;
    }
    const expMillis = decoded.exp * 1000;
    const now = Date.now();
    const refreshAt = expMillis - 60 * 1000; // one minute before actual expiry
    const msUntilRefresh = refreshAt - now;

    if (msUntilRefresh <= 0) {
      // If we’re already within that one-minute window (or past it), refresh now
      doRefresh();
    } else {
      // Otherwise, schedule a timer to refresh 1 minute before expiry
      console.log("Scheduling refresh in", msUntilRefresh, "ms");
      refreshTimeoutRef.current = setTimeout(() => {
        doRefresh();
      }, msUntilRefresh);
    }
  }, [token, doRefresh]);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setIsReady(true);
      return;
    }
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    api
      .get<AuthUser>("accounts/me/")
      .then((res) => {
        setUser(res.data);
        console.log("%cUSER AUTH DATA:", "color: limegreen;", user);
        localStorage.setItem("user", JSON.stringify(res.data));
        return api.get<UserProfile>("profile/me");
      })
      .then((res) => {
        setProfile(res.data);
        localStorage.setItem("profile", JSON.stringify(res.data));
      })
      .catch(() => signOut())
      .finally(() => {
        setLoading(false);
        setIsReady(true);
      });
  }, [token, signOut]);
  // console.log("Auth state:", { token, user, loading });

  useEffect(() => {
    scheduleRefresh();
    return () => {
      clearRefreshTimeout();
    };
  }, [token, scheduleRefresh]);

  const signIn = async ({ identifier, password }: SignInCredentials) => {
    try {
      const response = await api.post("accounts/sign_in/", {
        identifier,
        password,
      });
      const { access, refresh } = response.data;
      // salvează doar access+refresh
      localStorage.setItem("accessToken", access);
      localStorage.setItem("refreshToken", refresh);
      // console.log(">>> signIn stored:", localStorage.getItem("accessToken"));
      api.defaults.headers.common.Authorization = `Bearer ${access}`;

      setToken(access);
      {
        const decoded = jwtDecode(access);
        if (decoded.exp) {
          const expires = new Date(decoded.exp * 1000).toUTCString();
          document.cookie = `access_token=${access};expires=${expires};path=/;`;
        } else {
          document.cookie = `access_token=${access};path=/;`;
        }
      }
    } catch (error: any) {
      console.error("Sign in error:", error.response?.data || error.message);
      throw error;
    }
  };
  const changePassword = async (
    oldPassword: string,
    newPassword: string
  ): Promise<void> => {
    if (!token) {
      throw new Error("User is not authenticated.");
    }
    try {
      // Call your backend’s “change password” endpoint
      await api.post("accounts/change_password/", {
        password: oldPassword,
        newPassword: newPassword,
      });
      signOut("/login");
    } catch (error: any) {
      console.error(
        "Change password error:",
        error.response?.data || error.message
      );
      throw error;
    }
  };
  const deleteAccount = async (): Promise<void> => {
    if (!token) {
      throw new Error("User is not authenticated.");
    }
    try {
      await api.delete("accounts/me/");

      signOut("/goodbye");
    } catch (error: any) {
      console.error(
        "Delete account error:",
        error.response?.data || error.message
      );
      throw error;
    }
  };

  const value: AuthContextType = {
    isAuthenticated: !!token,
    token,
    user,
    profile,
    signIn,
    signOut,
    updateProfile,
    changePassword,
    deleteAccount,
    loading,
    isReady: !loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook personalizat pentru a accesa contextul
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
