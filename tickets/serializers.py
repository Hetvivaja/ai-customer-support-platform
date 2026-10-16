
from rest_framework import serializers
from tickets.models import Ticket


class TicketSerializer(serializers.ModelSerializer):

    customer_name = serializers.CharField(
        source="customer.username",
        read_only=True
    )

    assigned_agent_name = serializers.CharField(
        source="assigned_agent.username",
        read_only=True,
        allow_null=True
    )

    class Meta:
        model = Ticket

        fields = [
            "id",
            "title",
            "description",
            "customer",
            "customer_name",
            "assigned_agent",
            "assigned_agent_name",
            "status",
            "priority",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "customer",
            "customer_name",
            "assigned_agent",
            "assigned_agent_name",
            "created_at",
            "updated_at",
        ]

    def validate_title(self, value):
        if not value.strip():
            raise serializers.ValidationError(
                "Ticket title cannot be empty."
            )
        return value

    def validate_description(self, value):
        if not value.strip():
            raise serializers.ValidationError(
                "Ticket description cannot be empty."
            )
        return value
