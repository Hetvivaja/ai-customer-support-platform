from rest_framework import serializers
from chat.models import Message


class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(
        source="sender.username",
        read_only=True
    )

    class Meta:
        model = Message
        fields = [
            "id",
            "ticket",
            "sender",
            "sender_name",
            "content",
            "is_ai_generated",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "ticket",
            "sender",
            "sender_name",
            "is_ai_generated",
            "created_at",
        ]

    def validate_content(self, value):
        if not value.strip():
            raise serializers.ValidationError(
                "Message cannot be empty."
            )
        return value
