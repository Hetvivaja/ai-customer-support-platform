from django.contrib.auth import get_user_model
from django.db import transaction

from tickets.models import Ticket
from tickets.repositories.ticket_repository import TicketRepository

User = get_user_model()


@transaction.atomic
def create_ticket(customer, title, description, priority="MEDIUM"):
    return TicketRepository.create(
        customer=customer,
        title=title,
        description=description,
        priority=priority,
    )


def get_customer_tickets(customer):
    return TicketRepository.get_by_customer(customer.id)


def get_ticket_by_id(ticket_id):
    return TicketRepository.get_by_id(ticket_id)


def assign_ticket(ticket_id, agent_id):
    ticket = TicketRepository.get_by_id(ticket_id)

    if ticket is None:
        raise ValueError("Ticket not found.")

    agent = User.objects.filter(
        id=agent_id,
        role=User.Role.AGENT,
        is_active=True,
    ).first()

    if agent is None:
        raise ValueError("Active support agent not found.")

    return TicketRepository.update(
        ticket,
        assigned_agent=agent,
        status=Ticket.Status.IN_PROGRESS,
    )


def update_ticket_status(ticket_id, status):
    ticket = TicketRepository.get_by_id(ticket_id)

    if ticket is None:
        raise ValueError("Ticket not found.")

    allowed_statuses = Ticket.Status.values

    if status not in allowed_statuses:
        raise ValueError("Invalid ticket status.")

    return TicketRepository.update(ticket, status=status)