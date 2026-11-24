from django.conf import settings
from django.db import models


class Message(models.Model):

    class Channel(models.TextChoices):
        SUPPORT = "SUPPORT", "Support thread"
        AI = "AI", "AI assistant"

    ticket = models.ForeignKey(
        "tickets.Ticket",
        on_delete=models.CASCADE,
        related_name="messages",
    )

    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="sent_messages",
    )

    content = models.TextField()

    is_ai_generated = models.BooleanField(default=False)

    channel = models.CharField(
        max_length=10,
        choices=Channel.choices,
        default=Channel.SUPPORT,
        db_index=True,
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"{self.channel} message for Ticket #{self.ticket_id}"

class Conversation(models.Model):
    """One AI chat. If `ticket` is set, the AI answers using that ticket's context."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="ai_conversations",
    )
    ticket = models.ForeignKey(
        "tickets.Ticket",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,  # deleting a ticket keeps the chat history
        related_name="ai_conversations",
    )
    title = models.CharField(max_length=120, default="New chat")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]

    def __str__(self):
        return f"{self.user} - {self.title}"


class ConversationMessage(models.Model):

    class Role(models.TextChoices):
        USER = "USER", "User"
        ASSISTANT = "ASSISTANT", "AI assistant"

    conversation = models.ForeignKey(
        Conversation,
        on_delete=models.CASCADE,
        related_name="messages",
    )
    role = models.CharField(max_length=10, choices=Role.choices)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at", "id"]