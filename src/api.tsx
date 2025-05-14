import axios from "axios";
import { PostProps } from "./Components/Feed/Post2";
const api = axios.create({
  baseURL: "http://localhost:8000/api/", // URL-ul backend-ului tău Django+DRF
  withCredentials: true, // să trimită cookie-ul de sesiune
});

// Injector de header pentru fiecare request
api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem("accessToken");
  if (token && cfg.headers) {
    console.log(">> Request token:", localStorage.getItem("accessToken"));
    cfg.headers.Authorization = `Bearer ${token}`;
  }

  return cfg;
});
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
// Like / Unlike
export const likePost = (id: number) =>
  api.post<PostProps>(`/posts/${id}/like/`);
export const unlikePost = (id: number) =>
  api.delete<PostProps>(`/posts/${id}/like/`);

export const repostPost = (id: number) =>
  api.post<PostProps>(`/posts/${id}/repost/`);

export const quotePost = (parentId: number, text: string) =>
  api.post<PostProps>("/posts/", {
    parent: parentId,
    type: "quote",
    description: text,
  });

export default api;
