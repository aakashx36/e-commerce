import axios from "axios";

const api = axios.create({
  baseURL: "https://e-commerce-ufd5.onrender.com",
  withCredentials: true,
});

// REQUEST: Har request ke saath Token bhejo
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// RESPONSE: 401 aane par seedha Login Page par fenko
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // 1. Storage saaf karo
      localStorage.removeItem("token");
      localStorage.removeItem("userInfo");

      // 2. Agar user already login page par nahi hai, toh use wahan bhejo
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export default api;
