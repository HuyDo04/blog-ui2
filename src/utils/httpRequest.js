
import axios from "axios";

// 🔧 Tạo instance httpRequest
const httpRequest = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  withCredentials: true
});

// 🔑 Interceptor Request: thêm token nếu có
httpRequest.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

// 🔄 Refresh Token Logic
let isRefreshing = false;
const tokenListeners = [];

function subscribeTokenRefresh(callback) {
  tokenListeners.push(callback);
}

function onRefreshed(newToken) {
  tokenListeners.forEach((callback) => callback(newToken));
  tokenListeners.length = 0;
}

// Interceptor Response: xử lý 401 và refresh token
httpRequest.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const refreshToken = localStorage.getItem("refresh_token");
    const shouldRefresh =
      error.response?.status === 401 &&
      !originalRequest._retry &&
      refreshToken;

    if (shouldRefresh) {
      originalRequest._retry = true; // Đánh dấu để tránh lặp vô hạn

      if (!isRefreshing) {
        isRefreshing = true;

        try {
          const res = await axios.post(
            `${import.meta.env.VITE_BASE_URL}/refresh-token`,
            { refresh_token: refreshToken }
          );

          const { access_token, refresh_token: newRefreshToken } = res.data;

          setToken(access_token);
          localStorage.setItem("refresh_token", newRefreshToken);

          onRefreshed(access_token);
        } catch (refreshError) {
          console.error("Refresh token failed:", refreshError);
          clearToken();
          window.location.href = "/login";
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      //  Đợi token mới nếu đang refresh
      return new Promise((resolve) => {
        subscribeTokenRefresh((newToken) => {
          originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
          resolve(httpRequest(originalRequest)); //  Gửi lại request ban đầu
        });
      });
    }

    //  Nếu không thể refresh hoặc lỗi khác
    return Promise.reject(error);
  }
);


//  Utils
const send = async (method, url, data, config) => {
  const response = await httpRequest.request({
    method,
    url,
    data,
    ...config,
  });

  return response.data;
};

export const get = (url, config) => send("get", url, null, config);
export const post = (url, data, config) => send("post", url, data, config);
export const put = (url, data, config) => send("put", url, data, config);
export const patch = (url, data, config) => send("patch", url, data, config);
export const del = (url, config) => send("delete", url, null, config);

export const setToken = (token) => {
  if (token) {
    httpRequest.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    localStorage.setItem("token", token);
  } else {
    delete httpRequest.defaults.headers.common["Authorization"];
    localStorage.removeItem("token");
  }
};

export const clearToken = () => {
  delete httpRequest.defaults.headers.common["Authorization"];
  localStorage.removeItem("token");
  localStorage.removeItem("refresh_token");
};

export default {
  get,
  post,
  put,
  patch,
  del,
  setToken,
  clearToken,
};
