from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.exceptions import (
    NotFound,
    PermissionDenied,
    ValidationError,
)

from chat.models import Message
from chat.serializers import MessageSerializer
from chat.services.message_service import (
    send_message,
    get_ticket_messages,
)
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from chat.services.gemini_service import ask_gemini

class MessageListCreateView(generics.ListCreateAPIView):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        ticket_id = self.kwargs["ticket_id"]

        try:
            return get_ticket_messages(
                ticket_id=ticket_id,
                user=self.request.user,
            )
        except ValueError as error:
            raise NotFound(str(error))
        except PermissionError as error:
            raise PermissionDenied(str(error))

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            message = send_message(
                ticket_id=self.kwargs["ticket_id"],
                sender=request.user,
                content=serializer.validated_data["content"],
            )
        except ValueError as error:
            raise ValidationError(str(error))
        except PermissionError as error:
            raise PermissionDenied(str(error))

        response_serializer = self.get_serializer(message)

        return Response(
            response_serializer.data,
            status=status.HTTP_201_CREATED,
        )

class AIChatView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        from rest_framework import status
        from rest_framework.response import Response
        from .models import Message
        from tickets.models import Ticket
        from .services.gemini_service import ask_gemini

        question = request.data.get("question", "").strip()
        ticket_id= request.data.get("ticket_id")

        if not question:
            return Response(
                {"error": "Question is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not ticket_id:
            return Response(
                {"error": "ticket_id is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            ticket = Ticket.objects.get(
                id=ticket_id,
                # Only allow access to tickets assigned to this user
                # or otherwise owned by them, depending on your model.
            )
        except Ticket.DoesNotExist:
            return Response(
                {"error": "Ticket not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        try:
            answer = ask_gemini(question)
        except Exception as error:
            print("Gemini error:", type(error).__name__, str(error))
            return Response(
                {"error": "AI service is temporarily unavailable."},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        Message.objects.create(
            ticket=ticket,
            sender=request.user,
            content=question,
            is_ai_generated=False,
        )

        Message.objects.create(
            ticket=ticket,
            sender=request.user,
            content=answer,
            is_ai_generated=True,
        )

        return Response(
            {
                "ticket_id": ticket.id,
                "question": question,
                "answer": answer,
                "saved": True,
            },
            status=status.HTTP_200_OK,
        )
