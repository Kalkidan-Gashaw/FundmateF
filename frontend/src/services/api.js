import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
const API = axios.create({
  baseURL: `${apiUrl.replace(/\/$/, "")}/api`,
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
