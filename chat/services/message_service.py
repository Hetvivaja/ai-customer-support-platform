from django.db import transaction
from django.contrib.auth import get_user_model

from tickets.models import Ticket
from chat.repositories.message_repository import MessageRepository

User = get_user_model()


@transaction.atomic
def send_message(ticket_id, sender, content):
    content = content.strip()

    if not content:
        raise ValueError("Message cannot be empty.")

    ticket = Ticket.objects.filter(id=ticket_id).first()

    if ticket is None:
        raise ValueError("Ticket not found.")

    if sender.role == User.Role.CUSTOMER:
        if ticket.customer_id != sender.id:
            raise PermissionError(
                "You can only message on your own tickets."
            )

    elif sender.role == User.Role.AGENT:
        if ticket.assigned_agent_id != sender.id:
            raise PermissionError(
                "You can only message on tickets assigned to you."
            )

    elif sender.role not in [
        User.Role.ADMIN,
        User.Role.MANAGER,
    ]:
        raise PermissionError("You are not allowed to send messages.")

    if ticket.status in [
        Ticket.Status.RESOLVED,
        Ticket.Status.CLOSED,
    ]:
        raise ValueError("Cannot message on a closed or resolved ticket.")

    return MessageRepository.create(
        ticket=ticket,
        sender=sender,
        content=content,
    )


def get_ticket_messages(ticket_id, user):
    ticket = Ticket.objects.filter(id=ticket_id).first()

    if ticket is None:
        raise ValueError("Ticket not found.")

    if user.role == User.Role.CUSTOMER:
        if ticket.customer_id != user.id:
            raise PermissionError("You cannot view this ticket.")

    elif user.role == User.Role.AGENT:
        if ticket.assigned_agent_id != user.id:
            raise PermissionError("You cannot view this ticket.")

    elif user.role not in [
        User.Role.ADMIN,
        User.Role.MANAGER,
    ]:
        raise PermissionError("You are not allowed to view messages.")

    return MessageRepository.get_by_ticket(ticket_id)
