from tickets.models import Ticket


class TicketRepository:

    @staticmethod
    def create(**data):
        return Ticket.objects.create(**data)

    @staticmethod
    def get_by_id(ticket_id):
        return Ticket.objects.filter(id=ticket_id).first()

    @staticmethod
    def get_all():
        return Ticket.objects.all()

    @staticmethod
    def get_by_customer(customer_id):
        return Ticket.objects.filter(customer_id=customer_id)

    @staticmethod
    def get_by_agent(agent_id):
        return Ticket.objects.filter(assigned_agent_id=agent_id)
    
    @staticmethod
    def update(ticket, **kwargs):
        allowed = {
            "title",
            "description",
            "status",
            "priority",
            "assigned_agent",
            "ai_summary",
            "ai_suggested_priority",
        }
        for field, value in kwargs.items():
            if field not in allowed:
                raise ValueError(f"Unsupported field: {field}")
            setattr(ticket, field, value)

        ticket.save()
        return ticket

    @staticmethod
    def delete_by_id(ticket_id):
        ticket = TicketRepository.get_by_id(ticket_id)

        if ticket is None:
            return False

        ticket.delete()
        return True