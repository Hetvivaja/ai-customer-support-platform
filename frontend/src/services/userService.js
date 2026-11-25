import { apiRequest } from "./api";

export const getUsers = () => apiRequest("/auth/users/");

export const createUser = (data) =>
  apiRequest("/auth/users/", { method: "POST", body: data });

export const updateUser = (id, changes) =>
  apiRequest(`/auth/users/${id}/`, { method: "PATCH", body: changes });