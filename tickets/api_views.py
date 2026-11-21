from rest_framework import generics, permissions

from tickets.serializers import TicketSerializer
from tickets.services.ticket_service import (
    create_ticket,
    get_visible_tickets,
)


class VisibleTicketsMixin:
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = TicketSerializer

    def get_queryset(self):
        return get_visible_tickets(self.request.user)


class TicketListCreateView(VisibleTicketsMixin, generics.ListCreateAPIView):

    def perform_create(self, serializer):
        ticket = create_ticket(
            customer=self.request.user,
            title=serializer.validated_data["title"],
            description=serializer.validated_data["description"],
            priority=serializer.validated_data.get("priority", "MEDIUM"),
        )
        serializer.instance = ticket


class TicketDetailView(VisibleTicketsMixin, generics.RetrieveAPIView):
    pass


class TicketUpdateView(VisibleTicketsMixin, generics.UpdateAPIView):
    http_method_names = ["patch", "options", "head"]