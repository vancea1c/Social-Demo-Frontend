import axios from "axios";
import { PostProps } from "./Components/Feed/Post2";
import { UserProfile } from "./contexts/types";
import { Notification } from "./contexts/NotificationsContext";
import { FriendRequest } from "./contexts/FriendRequestsContext";
const api = axios.create({
  baseURL: "http://localhost:8000/api/",
  withCredentials: true, 
});

interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem("accessToken");
  if (token && cfg.headers) {
    // console.log(">> Request token:", localStorage.getItem("accessToken"));
    cfg.headers.Authorization = `Bearer ${token}`;
  }

  return cfg;
});

export interface ReplyResponse extends PostProps {
  parent_post: PostProps;
}

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response.status === 401 && !err.config._retry) {
      err.config._retry = true;
      const refresh = localStorage.getItem("refreshToken");
      if (refresh) {
        const { data } = await api.post("token/refresh/", { refresh });
        localStorage.setItem("accessToken", data.access);
        err.config.headers.Authorization = `Bearer ${data.access}`;
        return api(err.config);
      }
    }
    return Promise.reject(err);
  }
);

export const fetchUserProfile = (username: string) =>
  api.get<UserProfile>(`/profile/${username}`).then((res) => res.data);

export const fetchMyProfile = () =>
  api.get<UserProfile>(`/profile/me/`).then((res) => res.data);

export const updateUserProfile = (
  username: string,
  payload: Partial<UserProfile> | FormData
) =>
  api
    .patch<UserProfile>(`/profile/${username}/`, payload)
    .then((res) => res.data);

export const fetchLikedPosts = () => {
  return api.get<Paginated<PostProps>>("/posts/liked/").then((res) => res.data);
};

export const fetchPost = (id: number) => {
  // console.log(`[API] fetchPost id=${id}`);
  return api.get<PostProps>(`/posts/${id}/`).then((res) => {
    console.log(`[API] fetchPost RESULT id=${id}:`, res.data);
    return res;
  });
};

export const fetchPosts = (params?: { type?: string }) => {
  //console.log(`[API] fetchPosts`, params);
  return api
    .get<PostProps[] | Paginated<PostProps>>("/posts/", { params })
    .then((res) => {
      console.log(`[API] fetchPosts RESULT:`, res.data);
      return res;
    });
};
export const fetchUserPosts = (username: string, page: number = 1) => {
  return api
    .get<Paginated<PostProps>>(
      `/posts/?author__username=${username}&page=${page}`
    )
    .then((res) => res.data);
};

export const fetchReplies = (parentId: number) => {
  return api
    .get<Paginated<PostProps>>(`/posts/?type=reply&parent=${parentId}`)
    .then((res) => res.data);
};

export const createPost = (description: string, uploads: File[]) => {
  // console.log(`[API] createPost`, { description, uploads });
  const form = new FormData();
  form.append("description", description);
  uploads.forEach((f) => form.append("uploads", f));
  return api
    .post<PostProps>("/posts/", form, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((res) => {
      // console.log("[API] createPost RESULT:", res.data);
      return res;
    });
};

export const replyToPost = (postId: number, content: string) => {
  // console.log(`[API] replyToPost postId=${postId}, content="${content}"`);
  return api
    .post<ReplyResponse>(`/posts/${postId}/reply/`, { content })
    .then((res) => {
      // console.log(`[API] replyToPost RESULT postId=${postId}:`, res.data);
      return res;
    });
};

export const quotePost = (
  postId: number,
  description: string,
  uploads: File[] = []
) => {
  const form = new FormData();
  form.append("description", description);
  uploads.forEach((f) => form.append("uploads", f));
  return api.post<PostProps>(`/posts/${postId}/quote/`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const repostPost = (postId: number) => {
  // console.log(`[API] repostPost postId=${postId}`);
  return api.post<PostProps>(`/posts/${postId}/repost/`).then((res) => {
    // console.log(`[API] repostPost RESULT postId=${postId}:`, res.data);
    return res;
  });
};


export const likePost = (id: number) =>
  api.post<PostProps>(`/posts/${id}/like/`).then((res) => res.data);

export const unlikePost = (id: number) =>
  api.delete<PostProps>(`/posts/${id}/like/`).then((res) => res.data);


export const fetchNotifications = (
  page: number = 1
): Promise<Paginated<Notification>> =>
  api
    .get<Paginated<Notification>>("/notifications/", { params: { page } })
    .then((res) => res.data);

export const fetchUnreadNotifications = (
  page: number = 1
): Promise<Paginated<Notification>> =>
  api
    .get<Paginated<Notification>>("/notifications/unread/", {
      params: { page },
    })
    .then((res) => res.data);

export const fetchUnreadCount = (): Promise<{ unread: number }> =>
  api
    .get<{ unread: number }>("/notifications/unread_count/")
    .then((res) => res.data);

export const markAllNotificationsRead = (): Promise<{ marked: number }> =>
  api
    .post<{ marked: number }>("/notifications/mark_all_read/")
    .then((res) => res.data);

export const toggleNotificationRead = (id: number): Promise<Notification> =>
  api
    .post<Notification>(`/notifications/${id}/toggle_read/`)
    .then((res) => res.data);

export const sendFriendRequest = (to_username: string) =>
  api.post<FriendRequest>(`/friend-requests/`, { to_user: to_username });

export const fetchFriendRequests = (): Promise<{
  sent: FriendRequest[];
  received: FriendRequest[];
}> => {
  return api.get("/friend-requests/mine/").then((res) => res.data);
};
export const acceptFriendRequest = (id: number) =>
  api.patch(`/friend-requests/${id}/accept/`);

export const rejectFriendRequest = (id: number) =>
  api.patch(`/friend-requests/${id}/reject/`);

export const cancelFriendRequest = (id: number) =>
  api.delete(`/friend-requests/${id}/cancel/`);

export const removeFriend = async (username: string) => {
  await api.post("/friend-requests/remove/", { username });
};

export default api;
