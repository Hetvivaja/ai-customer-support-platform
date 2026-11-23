from chat.models import Message

class MessageRepository:

    @staticmethod
    def create(ticket, sender, content, is_ai_generated=False,
               channel=Message.Channel.SUPPORT):
        return Message.objects.create(
            ticket=ticket,
            sender=sender,
            content=content,
            is_ai_generated=is_ai_generated,
            channel=channel,
        )

    @staticmethod
    def get_by_id(message_id):
        return Message.objects.filter(id=message_id).first()

    @staticmethod
    def get_by_ticket(ticket_id, channel=None, sender_id=None):
        queryset = Message.objects.filter(ticket_id=ticket_id)

        if channel:
            queryset = queryset.filter(channel=channel)
        if sender_id:
            queryset = queryset.filter(sender_id=sender_id)

        return queryset.select_related("sender", "ticket")

    @staticmethod
    def get_recent_ai_history(ticket_id, user_id, limit=10):
        """Last `limit` AI-chat messages of this user on this ticket, oldest first."""
        recent = (
            Message.objects.filter(
                ticket_id=ticket_id,
                sender_id=user_id,
                channel=Message.Channel.AI,
            )
            .order_by("-created_at", "-id")[:limit]
        )
        return list(reversed(recent))

    @staticmethod
    def get_all():
        return Message.objects.all()

    @staticmethod
    def delete_by_id(message_id):
        message = MessageRepository.get_by_id(message_id)

        if message is None:
            return False

        message.delete()
        return True