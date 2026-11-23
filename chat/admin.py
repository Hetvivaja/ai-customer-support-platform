from django.contrib import admin
from .models import Message

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ("ticket", "sender", "channel", "is_ai_generated", "created_at")
    list_filter = ("channel", "is_ai_generated")
    search_fields = ("content",)
