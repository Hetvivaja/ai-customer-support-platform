from rest_framework import serializers

from chat.models import Conversation, ConversationMessage, Message


class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(
        source="sender.username",
        read_only=True,
    )

    class Meta:
        model = Message
        fields = [
            "id", "ticket", "sender", "sender_name",
            "content", "is_ai_generated", "channel", "created_at",
        ]
        read_only_fields = [
            "id", "ticket", "sender", "sender_name",
            "is_ai_generated", "channel", "created_at",
        ]

    def validate_content(self, value):
        if not value.strip():
            raise serializers.ValidationError("Message cannot be empty.")
        return value


class ConversationSerializer(serializers.ModelSerializer):
    ticket_title = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = ["id", "title", "ticket", "ticket_title", "created_at", "updated_at"]
        read_only_fields = fields

    def get_ticket_title(self, obj):
        return obj.ticket.title if obj.ticket_id else None


class ConversationMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ConversationMessage
        fields = ["id", "role", "content", "created_at"]
        read_only_fields = fields