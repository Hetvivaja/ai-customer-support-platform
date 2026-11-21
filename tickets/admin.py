from django.contrib import admin
from .models import Ticket

@admin.register(Ticket)
class TicketAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "customer",
        "assigned_agent",
        "status",
        "priority",
        "ai_suggested_priority",
        "created_at",
    )
    readonly_fields = ("ai_summary",)
    list_filter = ("status", "priority")
    search_fields = ("title", "description")
