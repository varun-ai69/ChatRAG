import axios from "axios";
import { clearAuth, getToken } from "./auth";

export const API_BASE = "http://localhost:3000";

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
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuth();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
