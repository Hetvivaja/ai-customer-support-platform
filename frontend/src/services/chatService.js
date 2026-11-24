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

export const askAI = (ticketId, question) =>
  apiRequest("/chat/ai/", {
    method: "POST",
    body: { ticket_id: Number(ticketId), question },
  });