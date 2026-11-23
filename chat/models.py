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