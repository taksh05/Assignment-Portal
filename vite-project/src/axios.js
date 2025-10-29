import axios from "axios";

const api = axios.create({
  baseURL: "https://assignment-portal-tx7f.onrender.com",
  withCredentials: true, // ✅ optional, if you send cookies or tokens
});

export default api;
