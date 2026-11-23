from django.db import transaction

from chat.models import Message
from chat.repositories.message_repository import MessageRepository
from tickets.models import Ticket
from tickets.services.ticket_service import get_ticket_for_user


@transaction.atomic
def send_message(ticket_id, sender, content):
    content = content.strip()

    if not content:
        raise ValueError("Message cannot be empty.")

    ticket = get_ticket_for_user(ticket_id, sender)  # ValueError if not visible

    if ticket.status in [Ticket.Status.RESOLVED, Ticket.Status.CLOSED]:
        raise ValueError("Cannot message on a closed or resolved ticket.")

    return MessageRepository.create(
        ticket=ticket,
        sender=sender,
        content=content,
        channel=Message.Channel.SUPPORT,
    )


def get_ticket_messages(ticket_id, user, channel=Message.Channel.SUPPORT):
    ticket = get_ticket_for_user(ticket_id, user)  # ValueError if not visible

    if channel == Message.Channel.AI:
        # The AI chat is private: only its owner can read it.
        return MessageRepository.get_by_ticket(
            ticket.id, channel=channel, sender_id=user.id
        )

    return MessageRepository.get_by_ticket(ticket.id, channel=channel)