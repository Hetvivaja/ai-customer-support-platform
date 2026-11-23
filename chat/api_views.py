from rest_framework import generics, permissions, status
from rest_framework.exceptions import (
    NotFound,
    PermissionDenied,
    ValidationError,
)
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from chat.models import Message
from chat.serializers import MessageSerializer
from chat.services.ai_chat_service import AIServiceError, ask_ai_on_ticket
from chat.services.message_service import (
    get_ticket_messages,
    send_message,
)


class MessageListCreateView(generics.ListCreateAPIView):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # ?channel=AI returns the user's private AI chat; default is the support thread.
        channel = self.request.query_params.get(
            "channel", Message.Channel.SUPPORT
        ).upper()

        if channel not in Message.Channel.values:
            raise ValidationError({"channel": "Invalid channel."})

        try:
            return get_ticket_messages(
                ticket_id=self.kwargs["ticket_id"],
                user=self.request.user,
                channel=channel,
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

        return Response(
            self.get_serializer(message).data,
            status=status.HTTP_201_CREATED,
        )


class AIChatView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "ai_chat"

    def post(self, request):
        question = request.data.get("question")

        if not isinstance(question, str) or not question.strip():
            return Response(
                {"error": "Question is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            ticket_id = int(request.data.get("ticket_id"))
        except (TypeError, ValueError):
            return Response(
                {"error": "A valid ticket_id is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            ticket, answer = ask_ai_on_ticket(
                ticket_id, request.user, question
            )
        except LookupError as error:
            return Response(
                {"error": str(error)}, status=status.HTTP_404_NOT_FOUND
            )
        except ValueError as error:
            return Response(
                {"error": str(error)}, status=status.HTTP_400_BAD_REQUEST
            )
        except AIServiceError as error:
            return Response(
                {"error": str(error)}, status=status.HTTP_502_BAD_GATEWAY
            )

        return Response(
            {
                "ticket_id": ticket.id,
                "question": question.strip(),
                "answer": answer,
                "saved": True,
            },
            status=status.HTTP_200_OK,
        )