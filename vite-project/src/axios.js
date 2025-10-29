// src/axios.js
import axios from "axios";

const API = axios.create({
  baseURL: "https://assignment-portal-tx7l.onrender.com/api", // ✅ Backend Render URL
});

// ✅ Automatically attach JWT token if available
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;
