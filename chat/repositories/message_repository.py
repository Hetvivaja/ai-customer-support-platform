from chat.models import Message


class MessageRepository:

    @staticmethod
    def create(ticket, sender, content, is_ai_generated=False):
        return Message.objects.create(
            ticket=ticket,
            sender=sender,
            content=content,
            is_ai_generated=is_ai_generated,
        )

    @staticmethod
    def get_by_id(message_id):
        return Message.objects.filter(id=message_id).first()

    @staticmethod
    def get_by_ticket(ticket_id):
        return Message.objects.filter(
            ticket_id=ticket_id
        ).select_related("sender", "ticket")

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
