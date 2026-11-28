import { apiRequest, clearSession } from "./api";

export const DASHBOARD = {
  CUSTOMER: "/dashboard",
  AGENT: "/agent-dashboard",
  MANAGER: "/manager-dashboard",
  ADMIN: "/admin-dashboard",
};

export async function login(email, password) {
  clearSession();

  const tokens = await apiRequest("/auth/login/", {
    method: "POST",
    body: { email: email.trim(), password },
    auth: false,
  });

  localStorage.setItem("access_token", tokens.access);
  localStorage.setItem("refresh_token", tokens.refresh);

  try {
    const user = await apiRequest("/auth/me/");
    const role = user.role?.toUpperCase();

    if (!DASHBOARD[role]) {
      throw new Error("Your account has an invalid role.");
    }

    localStorage.setItem("user_role", role);
    localStorage.setItem("user_data", JSON.stringify(user));
    return { user, role };
  } catch (error) {
    clearSession();
    throw error;
  }
}

export function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("user_data")) || null;
  } catch {
    return null;
  }
}

export const register = (username, email, password) =>
  apiRequest("/auth/register/", {
    method: "POST",
    body: { username: username.trim(), email: email.trim(), password },
    auth: false,
  });

export const getMe = () => apiRequest("/auth/me/");

export async function updateProfile(changes) {
  const user = await apiRequest("/auth/me/", { method: "PATCH", body: changes });
  localStorage.setItem("user_data", JSON.stringify(user));
  return user;
}

export const changePassword = (currentPassword, newPassword) =>
  apiRequest("/auth/change-password/", {
    method: "POST",
    body: { current_password: currentPassword, new_password: newPassword },
  });