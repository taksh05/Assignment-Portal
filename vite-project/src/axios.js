import axios from "axios";

const api = axios.create({
  baseURL: "https://assignment-portal-86z6.vercel.app/", // <- YOUR BACKEND URL
  withCredentials: false, // keep false unless you use cookies
});

export default api;
