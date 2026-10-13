from django.urls import path
from tickets.api_views import (
    TicketListCreateView,
    TicketDetailView,
)

urlpatterns = [
    path("", TicketListCreateView.as_view(), name="ticket-list-create"),
    path("<int:pk>/", TicketDetailView.as_view(), name="ticket-detail"),
]