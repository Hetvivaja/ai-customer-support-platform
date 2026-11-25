import { apiRequest, toList } from "./api";

export async function getTickets() {
  return toList(await apiRequest("/tickets/"));
}

export const getTicket = (id) => apiRequest(`/tickets/${id}/`);

export const createTicket = (title, description) =>
  apiRequest("/tickets/", { method: "POST", body: { title, description } });

export const updateTicket = (id, changes) =>
  apiRequest(`/tickets/${id}/update/`, { method: "PATCH", body: changes });

export const assignTicket = (id, agentId) =>
  apiRequest(`/tickets/${id}/assign/`, {
    method: "POST",
    body: { agent_id: agentId },
  });

export const getAISummary = (id) =>
  apiRequest(`/tickets/${id}/ai-summary/`, { method: "POST" });

export const getAIPriority = (id) =>
  apiRequest(`/tickets/${id}/ai-priority/`, { method: "POST" });

export const getAgents = () => apiRequest("/auth/agents/");

export const getTicketStats = () => apiRequest("/tickets/stats/");