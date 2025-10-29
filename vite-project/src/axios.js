import axios from "axios";

const API = axios.create({
  baseURL: "https://assignment-portal-tx7l.onrender.com/api",
});

export default API;
