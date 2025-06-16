import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
  useRef,
} from "react";
import { fetchUserProfile, fetchMyProfile, updateUserProfile } from "../api";
import { UserProfile } from "./types";
import { useAuth } from "./AuthContext";

interface UserProfilesContextType {
  profiles: Record<string, UserProfile>;
  fetchProfile: (username: string) => Promise<UserProfile>;
  fetchMyProfile: () => Promise<UserProfile>;
  updateProfile: (profile: UserProfile) => void;
  patchProfile: (
    username: string,
    data: Partial<UserProfile> | FormData
  ) => Promise<UserProfile>;
}

const UserProfilesContext = createContext<UserProfilesContextType | undefined>(
  undefined
);

export const UserProfilesProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [profiles, setProfiles] = useState<Record<string, UserProfile>>({});
  const { token, isReady } = useAuth();
  const hasFetchedMe = useRef(false);
  useEffect(() => {
    if (!token || !isReady || hasFetchedMe.current) return;
    hasFetchedMe.current = true;
    fetchMyProfile()
      .then((me) => setProfiles((prev) => ({ ...prev, [me.username]: me })))
      .catch(() => {});
  }, [token, isReady]);

  const fetchProfileFn = async (username: string) => {
    if (profiles[username]) return profiles[username];
    const prof = await fetchUserProfile(username);
    setProfiles((prev) => ({ ...prev, [username]: prof }));
    return prof;
  };

  const fetchMyProfileFn = async () => {
    const me = await fetchMyProfile();
    setProfiles((prev) => ({ ...prev, [me.username]: me }));
    return me;
  };
  const updateProfile = (profile: UserProfile) => {
    setProfiles((prev) => ({ ...prev, [profile.username]: profile }));
  };
  const patchProfile = async (
    username: string,
    data: Partial<UserProfile> | FormData
  ) => {
    const updated = await updateUserProfile(username, data);
    setProfiles((prev) => ({ ...prev, [username]: updated }));
    return updated;
  };
  useEffect(() => {
    console.log("%c USER PROFILES:", "color: yellow;", profiles);
  }, [profiles]);
  return (
    <UserProfilesContext.Provider
      value={{
        profiles,
        fetchProfile: fetchProfileFn,
        fetchMyProfile: fetchMyProfileFn,
        updateProfile,
        patchProfile,
      }}
    >
      {children}
    </UserProfilesContext.Provider>
  );
};

export const useUserProfiles = (): UserProfilesContextType => {
  const ctx = useContext(UserProfilesContext);
  if (!ctx) {
    throw new Error("useUserProfiles must be used within UserProfilesProvider");
  }
  return ctx;
};
