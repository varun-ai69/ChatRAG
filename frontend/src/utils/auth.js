const TOKEN_KEY = "token";
const API_KEY_KEY = "apiKey";
const USER_KEY = "user";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getApiKey() {
  return localStorage.getItem(API_KEY_KEY);
}

export function getUser() {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveAuth({ token, apiKey, user }) {
  if (token != null) localStorage.setItem(TOKEN_KEY, token);
  if (apiKey != null) localStorage.setItem(API_KEY_KEY, apiKey);
  if (user != null) localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(API_KEY_KEY);
  localStorage.removeItem(USER_KEY);
}
