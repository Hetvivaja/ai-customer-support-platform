export const BASE_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

export function clearSession() {
  ["access_token", "refresh_token", "user_role", "user_data"].forEach((key) =>
    localStorage.removeItem(key)
  );
}

export function logout() {
  clearSession();
  window.location.href = "/";
}

function extractMessage(data, fallback) {
  if (!data) return fallback;
  if (typeof data === "string") return data;
  if (data.detail) return data.detail;
  if (data.error) return data.error;

  const first = Object.values(data)[0];
  if (Array.isArray(first)) return first[0];
  if (typeof first === "string") return first;
  return fallback;
}

// Only one refresh request runs at a time, even if many calls fail together.
let refreshPromise = null;

async function refreshAccessToken() {
  const refresh = localStorage.getItem("refresh_token");
  if (!refresh) return false;

  if (!refreshPromise) {
    refreshPromise = fetch(`${BASE_URL}/auth/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    })
      .then(async (response) => {
        if (!response.ok) return false;
        const data = await response.json();
        localStorage.setItem("access_token", data.access);
        if (data.refresh) localStorage.setItem("refresh_token", data.refresh);
        return true;
      })
      .catch(() => false)
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

export async function apiRequest(path, { method = "GET", body, auth = true } = {}) {
  async function send() {
    const headers = {};
    if (body !== undefined) headers["Content-Type"] = "application/json";
    if (auth) {
      headers.Authorization = `Bearer ${localStorage.getItem("access_token")}`;
    }

    return fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  let response;
  try {
    response = await send();
  } catch {
    throw new ApiError("Cannot connect to the server.", 0, null);
  }

  if (response.status === 401 && auth) {
    const refreshed = await refreshAccessToken();
    if (!refreshed) {
      logout();
      throw new ApiError("Your session has expired.", 401, null);
    }
    response = await send();
  }

  let data = null;
  if (response.status !== 204) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    throw new ApiError(
      extractMessage(data, "Something went wrong."),
      response.status,
      data
    );
  }

  return data;
}

// Supports plain arrays and paginated { results: [...] } responses.
export function toList(data) {
  return Array.isArray(data) ? data : data?.results || [];
}