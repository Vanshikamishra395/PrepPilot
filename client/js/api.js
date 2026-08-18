// js/api.js
// Centralized helper for calling the PrepPilot backend API.
// Every page includes this file so we don't repeat fetch/token logic everywhere.

const API_BASE_URL = "/api";

function getToken() {
  return localStorage.getItem("preppilot_token");
}

function setToken(token) {
  localStorage.setItem("preppilot_token", token);
}

function clearToken() {
  localStorage.removeItem("preppilot_token");
  localStorage.removeItem("preppilot_user");
}

function setStoredUser(user) {
  localStorage.setItem("preppilot_user", JSON.stringify(user));
}

function getStoredUser() {
  const raw = localStorage.getItem("preppilot_user");
  return raw ? JSON.parse(raw) : null;
}

function isLoggedIn() {
  return !!getToken();
}

/**
 * Makes a request to the PrepPilot API.
 * @param {string} path - e.g. "/auth/login"
 * @param {object} options - { method, body }
 * @param {boolean} requiresAuth - attach the Authorization header
 */
async function apiRequest(path, options = {}, requiresAuth = false) {
  const headers = { "Content-Type": "application/json" };

  if (requiresAuth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method || "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await response.json();

  if (!response.ok) {
    // If the token is invalid/expired, force the user back to login.
    if (response.status === 401 && requiresAuth) {
      clearToken();
      window.location.href = "login.html";
    }
    throw new Error(data.message || "Something went wrong.");
  }

  return data;
}

// Redirects unauthenticated users away from protected pages.
// Call this at the top of dashboard/quiz/coding/etc. pages.
function requireLogin() {
  if (!isLoggedIn()) {
    window.location.href = "login.html";
  }
}
