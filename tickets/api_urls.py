from django.urls import path
from tickets.api_views import (
    TicketListCreateView,
    TicketDetailView,
    TicketUpdateView,
)

urlpatterns = [
    path("", TicketListCreateView.as_view(), name="ticket-list-create"),
    path("<int:pk>/", TicketDetailView.as_view(), name="ticket-detail"),
    path("<int:pk>/update/", TicketUpdateView.as_view(), name="ticket-update"),
]