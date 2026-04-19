import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://version-backend-api.duckdns.org",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("userId");
      window.location.href = "/auth";
    }
    console.error("API Error:", error.message);
    return Promise.reject(error);
  }
);

export default axiosInstance;