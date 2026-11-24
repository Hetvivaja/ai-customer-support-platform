import { apiRequest, toList } from "./api";

// channel: "SUPPORT" (customer <-> agent thread) or "AI" (private AI chat)
export async function getMessages(ticketId, channel = "SUPPORT") {
  return toList(
    await apiRequest(`/chat/tickets/${ticketId}/messages/?channel=${channel}`)
  );
}

export const sendSupportMessage = (ticketId, content) =>
  apiRequest(`/chat/tickets/${ticketId}/messages/`, {
    method: "POST",
    body: { content },
  });

export async function getConversations() {
  return toList(await apiRequest("/chat/conversations/"));
}

export const createConversation = (ticketId = null) =>
  apiRequest("/chat/conversations/", {
    method: "POST",
    body: ticketId ? { ticket_id: Number(ticketId) } : {},
  });

export const getConversation = (id) => apiRequest(`/chat/conversations/${id}/`);

export const deleteConversation = (id) =>
  apiRequest(`/chat/conversations/${id}/`, { method: "DELETE" });

export const askConversation = (id, question) =>
  apiRequest(`/chat/conversations/${id}/messages/`, {
    method: "POST",
    body: { question },
  });