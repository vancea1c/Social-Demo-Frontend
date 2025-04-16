import {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";
import axios from "axios";

type User = {
  id: number;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
};
export type SignInCredentials = {
  identifier: string;
  password: string;
};

type AuthContextType = {
  isAuthenticated: boolean;
  token: string | null;
  user: User | null;
  signIn: (credentials: SignInCredentials) => Promise<void>;
  signOut: () => void;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    console.log("Stored token:", storedToken);
    console.log("Stored user:", storedUser);
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  console.log("Auth state:", { token, user, loading });

  const signIn = async ({ identifier, password }: SignInCredentials) => {
    try {
      const response = await axios.post("http://localhost:8000/api/sign_in/", {
        identifier,
        password,
      });
      const data = response.data;
      setToken(data.token);
      setUser({
        id: data.user_id,
        first_name: data.first_name,
        last_name: data.last_name,
        username: data.username,
        email: data.email,
      });
      localStorage.setItem("token", data.token);
      localStorage.setItem(
        "user",
        JSON.stringify({
          id: data.user_id,
          first_name: data.first_name,
          last_name: data.last_name,
          username: data.username,
          email: data.email,
        })
      );
    } catch (error: any) {
      console.error(
        "Eroare la sign in:",
        error.response?.data || error.message
      );
      throw error;
    }
  };

  const signOut = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  const value: AuthContextType = {
    isAuthenticated: !!token,
    token,
    user,
    signIn,
    signOut,
    loading,
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
