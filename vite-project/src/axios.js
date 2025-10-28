// vite-project/src/axios.js
import axios from "axios";

const api = axios.create({
  // 👇 relative path works on both local and deployed versions
  baseURL: "/api",
  withCredentials: true,
});

export default api;
