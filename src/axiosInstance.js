import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://version-backend-api.duckdns.org",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // We only want to log out if the server DEFINITELY sent a 401.
    // If it's a network error (no error.response), we stay logged in.
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("userId");
      localStorage.removeItem("token");
      window.location.href = "/auth";
    }
    
    console.error("API Error:", error.message);
    return Promise.reject(error);
  }
);

export default axiosInstance;