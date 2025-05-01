export interface AuthUser {
    id: number;
    first_name: string;
    last_name: string;
    username: string;
    email: string;
  }
  
  export interface UserProfile {
    cover_image?: string | null;
    name: string;
    profile_image: string;
    bio?: string;
    is_private: boolean;
    gender: string;
  }
  