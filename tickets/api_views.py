from rest_framework import generics, permissions, status
from rest_framework.exceptions import NotFound, PermissionDenied, ValidationError
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from chat.services.ai_chat_service import AIServiceError
from tickets.serializers import TicketSerializer
from tickets.services.ticket_ai_service import (
    generate_ticket_summary,
    suggest_ticket_priority,
)
from tickets.services.ticket_service import (
    assign_ticket,
    create_ticket,
    get_ticket_stats,
    get_visible_tickets,
    update_ticket,
)
from users.permissions import IsManagerOrAdmin, IsStaffRole

def _to_api_error(error):
    if isinstance(error, PermissionError):
        return PermissionDenied(str(error))
    if str(error) == "Ticket not found.":
        return NotFound(str(error))
    return ValidationError(str(error))


def _ticket_response(ticket, request):
    return TicketSerializer(ticket, context={"request": request}).data


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


class TicketUpdateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        try:
            ticket = update_ticket(pk, request.user, request.data)
        except (ValueError, PermissionError) as error:
            raise _to_api_error(error)

        return Response(_ticket_response(ticket, request))


class AssignTicketView(APIView):
    permission_classes = [IsManagerOrAdmin]

    def post(self, request, pk):
        agent_id = request.data.get("agent_id")

        if agent_id is None:
            raise ValidationError("agent_id is required.")

        try:
            ticket = assign_ticket(pk, agent_id, request.user)
        except (ValueError, PermissionError) as error:
            raise _to_api_error(error)

        return Response(_ticket_response(ticket, request))


class TicketAISummaryView(APIView):
    permission_classes = [IsStaffRole]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "ai_ticket"

    def post(self, request, pk):
        try:
            ticket = generate_ticket_summary(pk, request.user)
        except (ValueError, PermissionError) as error:
            raise _to_api_error(error)
        except AIServiceError as error:
            return Response(
                {"error": str(error)}, status=status.HTTP_502_BAD_GATEWAY
            )

        return Response({"ticket_id": ticket.id, "summary": ticket.ai_summary})


class TicketAIPriorityView(APIView):
    permission_classes = [IsStaffRole]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "ai_ticket"

    def post(self, request, pk):
        try:
            ticket, reason = suggest_ticket_priority(pk, request.user)
        except (ValueError, PermissionError) as error:
            raise _to_api_error(error)
        except AIServiceError as error:
            return Response(
                {"error": str(error)}, status=status.HTTP_502_BAD_GATEWAY
            )

        return Response({
            "ticket_id": ticket.id,
            "current_priority": ticket.priority,
            "suggested_priority": ticket.ai_suggested_priority,
            "reason": reason,
        })

class TicketStatsView(APIView):
    permission_classes = [IsManagerOrAdmin]

    def get(self, request):
        try:
            return Response(get_ticket_stats(request.user))
        except PermissionError as error:
            raise PermissionDenied(str(error))