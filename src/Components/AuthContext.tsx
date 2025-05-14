import {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";
import api from "../api";
import { AuthUser, UserProfile } from "../contexts/types";

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
  signIn: (credentials: SignInCredentials) => Promise<void>;
  signOut: () => void;
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
  const [loading, setLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);

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
        return api.get<UserProfile>("profile/me");
      })
      .then((res) => setProfile(res.data))
      .catch(() => signOut())
      .finally(() => {
        setLoading(false);
        setIsReady(true);
      });
  }, [token]);
  console.log("Auth state:", { token, user, loading });

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
      console.log(">>> signIn stored:", localStorage.getItem("accessToken"));
      api.defaults.headers.common.Authorization = `Bearer ${access}`;

      setToken(access);

      // 2️⃣ Obţinerea datelor user
      const userRes = await api.get<AuthUser>("accounts/me/");
      setUser(userRes.data);
      // mută salvarea user fă imediat după ce ai userRes
      localStorage.setItem("user", JSON.stringify(userRes.data));

      // 3️⃣ Obţinerea profilului
      const profRes = await api.get<UserProfile>("profile/me/");
      setProfile(profRes.data);
    } catch (error: any) {
      console.error(
        "Eroare la sign in:",
        error.response?.data || error.message
      );
      throw error;
    }
  };

  const signOut = (redirectUrl: string = "/") => {
    // Full page reload redirect
    window.location.replace(redirectUrl);
    setToken(null);
    setUser(null);
    setProfile(null);
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    delete api.defaults.headers.common.Authorization;
  };
  const value: AuthContextType = {
    isAuthenticated: !!token,
    token,
    user,
    profile,
    signIn,
    signOut,
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
