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
