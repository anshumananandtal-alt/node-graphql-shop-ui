import {
  SESSION_DURATION_MS,
  TOKEN_EXPIRY_KEY,
  TOKEN_KEY,
  USER_ID_KEY,
  ROLE
} from "../constants";

export function saveSession(token, userId, role) {
  if (typeof token !== "string" || token.length === 0) {
    throw new Error("A non-empty authentication token is required.");
  }
  if (typeof userId !== "string" || userId.length === 0) {
    throw new Error("A non-empty user ID is required.");
  }
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_ID_KEY, userId);
  localStorage.setItem(ROLE, role)
  localStorage.setItem(
    TOKEN_EXPIRY_KEY,
    String(Date.now() + SESSION_DURATION_MS),
  );
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_ID_KEY);
  localStorage.removeItem(ROLE);
  localStorage.removeItem(TOKEN_EXPIRY_KEY);
}

export function getSessionUserId() {
  return localStorage.getItem(USER_ID_KEY);
}

export function getSessionRole() {
  return localStorage.getItem(ROLE);
}

export function getSessionExpiry() {
  const expiry = Number(localStorage.getItem(TOKEN_EXPIRY_KEY));
  return Number.isFinite(expiry) && expiry > 0 ? expiry : null;
}

export function hasValidSession() {
  const token = localStorage.getItem(TOKEN_KEY);
  const expiry = getSessionExpiry();

  if (token && expiry && expiry > Date.now()) {
    return true;
  }

  return false;
}
