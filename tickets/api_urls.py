from django.urls import path
from tickets.api_views import (
    AssignTicketView,
    TicketAIPriorityView,
    TicketAISummaryView,
    TicketDetailView,
    TicketListCreateView,
    TicketUpdateView,
)

urlpatterns = [
    path("", TicketListCreateView.as_view(), name="ticket-list-create"),
    path("<int:pk>/", TicketDetailView.as_view(), name="ticket-detail"),
    path("<int:pk>/update/", TicketUpdateView.as_view(), name="ticket-update"),
    path("<int:pk>/assign/", AssignTicketView.as_view(), name="ticket-assign"),
    path("<int:pk>/ai-summary/", TicketAISummaryView.as_view(), name="ticket-ai-summary"),
    path("<int:pk>/ai-priority/", TicketAIPriorityView.as_view(), name="ticket-ai-priority"),
]