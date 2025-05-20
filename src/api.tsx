import axios from "axios";
import { PostProps } from "./Components/Feed/Post2";
const api = axios.create({
  baseURL: "http://localhost:8000/api/", // URL-ul backend-ului tău Django+DRF
  withCredentials: true, // să trimită cookie-ul de sesiune
});

type Paginated<T> = { results: T[] };
// Injector de header pentru fiecare request
api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem("accessToken");
  if (token && cfg.headers) {
    console.log(">> Request token:", localStorage.getItem("accessToken"));
    cfg.headers.Authorization = `Bearer ${token}`;
  }

  return cfg;
});

export interface ReplyResponse extends PostProps {
  parent_post: PostProps;
}

// (opțional) auto-refresh la 401:
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
export const fetchPost = (id: number) => api.get<PostProps>(`/posts/${id}/`);

export const fetchPosts = (params?: { type?: string }) =>
  api.get<PostProps[] | Paginated<PostProps>>("/posts/", { params });

export const fetchReplies = (id: number) =>
  api.get<PostProps[]>(`/posts/?type=reply&parent=${id}`);

export const createPost = (description: string, uploads: File[]) => {
  const form = new FormData();
  form.append("description", description);
  uploads.forEach((f) => form.append("uploads", f));
  return api.post<PostProps>("/posts/", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const replyToPost = (postId: number, content: string) =>
  api.post<ReplyResponse>(`/posts/${postId}/reply/`, { content });

export const quotePost = (
  postId: number,
  description: string,
  uploads: File[] = []
) => {
  const form = new FormData();
  form.append("description", description);
  // presupunem că pe backend accepţi un câmp numit "uploads"
  uploads.forEach((f) => form.append("uploads", f));
  return api.post<PostProps>(`/posts/${postId}/quote/`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const repostPost = (postId: number) =>
  api.post<PostProps>(`/posts/${postId}/repost/`);

// Like / Unlike
export const likePost = (id: number) =>
  api.post<PostProps>(`/posts/${id}/like/`);
export const unlikePost = (id: number) =>
  api.delete<PostProps>(`/posts/${id}/like/`);

export default api;
