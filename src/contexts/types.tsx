export interface AuthUser {
  id: number;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
}

export interface UserProfile {
  username: string;
  cover_image?: string | null;
  name: string;
  profile_image: string;
  bio?: string;
  is_private: boolean;
  gender: string;
  date_joined: string;
  friends_count?: number;
  are_friends?: boolean;
}
