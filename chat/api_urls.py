from django.urls import path
from chat.api_views import MessageListCreateView

urlpatterns = [
    path(
        "tickets/<int:ticket_id>/messages/",
        MessageListCreateView.as_view(),
        name="ticket-messages",
    ),
]
