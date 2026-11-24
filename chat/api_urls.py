from django.urls import path
from chat.api_views import (
    AIChatView,
    ConversationDetailView,
    ConversationListCreateView,
    ConversationMessageView,
    MessageListCreateView,)

urlpatterns = [
    # Human support thread (customer <-> agent)
    path("tickets/<int:ticket_id>/messages/", MessageListCreateView.as_view(), name="ticket-messages"),

    # Independent AI conversations
    path("conversations/", ConversationListCreateView.as_view(), name="conversation-list"),
    path("conversations/<int:conversation_id>/", ConversationDetailView.as_view(), name="conversation-detail"),
    path("conversations/<int:conversation_id>/messages/", ConversationMessageView.as_view(), name="conversation-message"),

    # Old ticket-bound AI endpoint (no longer used by the frontend)
    path("ai/", AIChatView.as_view(), name="ai-chat"),
]