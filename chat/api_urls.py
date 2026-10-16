from django.urls import path
from chat.api_views import MessageListCreateView,AIChatView

urlpatterns = [
    path(
        "tickets/<int:ticket_id>/messages/",
        MessageListCreateView.as_view(),
        name="ticket-messages",
    ),
    path(
        "ai/",
        AIChatView.as_view(),
        name="ai-chat",
    ),
]
