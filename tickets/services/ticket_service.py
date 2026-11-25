from django.db.models import Count
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

def get_visible_tickets(user):
    """Tickets this user is allowed to see."""
    if user.role in (User.Role.ADMIN, User.Role.MANAGER):
        queryset = TicketRepository.get_all()
    elif user.role == User.Role.AGENT:
        queryset = TicketRepository.get_by_agent(user.id)
    else:
        queryset = TicketRepository.get_by_customer(user.id)

    return queryset.select_related("customer", "assigned_agent")

def get_ticket_for_user(ticket_id, user):
    """Return the ticket if the user may see it, otherwise raise ValueError.

    A forbidden ticket gives the same error as a missing one, so users
    can't discover which ticket IDs exist.
    """
    ticket = get_visible_tickets(user).filter(id=ticket_id).first()

    if ticket is None:
        raise ValueError("Ticket not found.")

    return ticket

STAFF_ROLES = (User.Role.AGENT, User.Role.MANAGER, User.Role.ADMIN)
def assign_ticket(ticket_id, agent_id, actor):
    if actor.role not in (User.Role.MANAGER, User.Role.ADMIN):
        raise PermissionError("Only managers and admins can assign tickets.")

    ticket = get_ticket_for_user(ticket_id, actor)

    if ticket.status == Ticket.Status.CLOSED:
        raise ValueError("Cannot assign a closed ticket.")

    agent = User.objects.filter(
        id=agent_id,
        role=User.Role.AGENT,
        is_active=True,
    ).first()

    if agent is None:
        raise ValueError("Active support agent not found.")

    changes = {"assigned_agent": agent}
    if ticket.status == Ticket.Status.OPEN:
        changes["status"] = Ticket.Status.IN_PROGRESS

    return TicketRepository.update(ticket, **changes)

def update_ticket(ticket_id, actor, data):
    """Apply a partial update. What can change depends on the actor's role."""
    ticket = get_ticket_for_user(ticket_id, actor)

    if actor.role in STAFF_ROLES:
        allowed = {"status", "priority"}
    else:
        if ticket.status != Ticket.Status.OPEN:
            raise PermissionError("You can only edit open requests.")
        allowed = {"title", "description"}

    forbidden = [field for field in data if field not in allowed]
    if forbidden:
        raise PermissionError(f"You cannot change: {', '.join(forbidden)}.")

    changes = {}

    for field in allowed & set(data):
        value = data[field]

        if field == "status":
            if value not in Ticket.Status.values:
                raise ValueError("Invalid ticket status.")
        elif field == "priority":
            if value not in Ticket.Priority.values:
                raise ValueError("Invalid ticket priority.")
        else:
            value = str(value).strip()
            if not value:
                raise ValueError(f"{field.capitalize()} cannot be empty.")
            if field == "title" and len(value) > 200:
                raise ValueError("Title is too long (maximum 200 characters).")

        changes[field] = value

    if not changes:
        raise ValueError("Nothing to update.")

    return TicketRepository.update(ticket, **changes)

def get_ticket_stats(actor):
    if actor.role not in (User.Role.MANAGER, User.Role.ADMIN):
        raise PermissionError("Only managers and admins can view statistics.")

    tickets = get_visible_tickets(actor)

    def count_by(field, choices):
        rows = tickets.order_by().values(field).annotate(n=Count("id"))
        found = {row[field]: row["n"] for row in rows}
        return {value: found.get(value, 0) for value in choices}

    return {
        "total": tickets.count(),
        "unassigned": tickets.filter(
            assigned_agent__isnull=True,
        ).exclude(
            status__in=[Ticket.Status.RESOLVED, Ticket.Status.CLOSED]
        ).count(),
        "by_status": count_by("status", Ticket.Status.values),
        "by_priority": count_by("priority", Ticket.Priority.values),
    }