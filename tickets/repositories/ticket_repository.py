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
    def update(ticket, **kwargs):
        for field, value in kwargs.items():
            if field not in {
                "title",
                "description",
                "status",
                "priority",
                "assigned_agent",
            }:
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