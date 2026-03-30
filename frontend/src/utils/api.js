import axios from "axios";
import { clearAuth, getToken } from "./auth";

export const API_BASE = import.meta.env.VITE_API_URL || "https://chatrag-jz3p.onrender.com";

export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

/** Do not attach Bearer token to login/register (avoids useless header + helps if old token remains). */
function isPublicAuthRequest(config) {
  const path = String(config.url || "").split("?")[0];
  return path === "/api/auth/login" || path === "/api/auth/register-company";
}

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token && !isPublicAuthRequest(config)) {
    config.headers.Authorization = `Bearer ${token}`;
  } else if (!token && !isPublicAuthRequest(config)) {
    console.warn("⚠️ No token found");
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Unauthorized — but not redirecting immediately");
      // clearAuth();
      // window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
