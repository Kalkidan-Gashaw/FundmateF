import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
const normalized = apiUrl.replace(/\/$/, "");
const baseURL = normalized.endsWith("/api") ? normalized : `${normalized}/api`;

const API = axios.create({
  baseURL,
});

// Add token to every request
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;
