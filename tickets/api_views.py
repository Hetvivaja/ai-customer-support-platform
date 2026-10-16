
from rest_framework import generics, permissions
from rest_framework.exceptions import NotFound

from tickets.models import Ticket
from tickets.serializers import TicketSerializer
from tickets.services.ticket_service import (
    create_ticket,
    get_customer_tickets,
)


class TicketListCreateView(generics.ListCreateAPIView):
    serializer_class = TicketSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.role in ["ADMIN", "MANAGER"]:
            return Ticket.objects.all()

        if user.role == "AGENT":
            return Ticket.objects.filter(assigned_agent=user)

        return get_customer_tickets(user)

    def perform_create(self, serializer):
        ticket = create_ticket(
            customer=self.request.user,
            title=serializer.validated_data["title"],
            description=serializer.validated_data["description"],
            priority=serializer.validated_data.get("priority", "MEDIUM"),
        )
        serializer.instance = ticket


class TicketDetailView(generics.RetrieveAPIView):
    serializer_class = TicketSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.role in ["ADMIN", "MANAGER"]:
            return Ticket.objects.all()

        if user.role == "AGENT":
            return Ticket.objects.filter(assigned_agent=user)

        return get_customer_tickets(user)


class TicketUpdateView(generics.UpdateAPIView):
    serializer_class = TicketSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ["patch", "options", "head"]

    def get_queryset(self):
        user = self.request.user

        if user.role in ["ADMIN", "MANAGER"]:
            return Ticket.objects.all()

        if user.role == "AGENT":
            return Ticket.objects.filter(assigned_agent=user)

        return get_customer_tickets(user)
