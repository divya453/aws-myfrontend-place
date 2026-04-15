import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://3.108.191.174:3000",
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
    // If the server explicitly says i am not logged in anymore
    if (error.response?.status === 401) {
      localStorage.removeItem("userId");
      localStorage.removeItem("token");
      window.location.href = "/auth";
    }
    
    
    return Promise.reject(error);
  }
);

export default axiosInstance;